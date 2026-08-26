export type RouteCoordinate = [longitude: number, latitude: number];

function segmentLength(start: RouteCoordinate, end: RouteCoordinate) {
  const averageLatitude = ((start[1] + end[1]) / 2) * Math.PI / 180;
  const longitudeDistance = (end[0] - start[0]) * Math.cos(averageLatitude);
  const latitudeDistance = end[1] - start[1];

  return Math.hypot(longitudeDistance, latitudeDistance);
}

export function sliceRouteAtProgress(
  coordinates: readonly RouteCoordinate[],
  progress: number,
): RouteCoordinate[] {
  if (coordinates.length === 0) return [];
  if (coordinates.length === 1) return [coordinates[0], coordinates[0]];

  const clampedProgress = Math.min(1, Math.max(0, progress));
  const segmentLengths = coordinates.slice(1).map((coordinate, index) => (
    segmentLength(coordinates[index], coordinate)
  ));
  const totalLength = segmentLengths.reduce((sum, length) => sum + length, 0);

  if (totalLength === 0 || clampedProgress === 0) {
    return [coordinates[0], coordinates[0]];
  }
  if (clampedProgress === 1) return [...coordinates];

  const targetLength = totalLength * clampedProgress;
  const visibleCoordinates: RouteCoordinate[] = [coordinates[0]];
  let coveredLength = 0;

  for (let index = 0; index < segmentLengths.length; index += 1) {
    const currentSegmentLength = segmentLengths[index];
    const segmentEnd = coordinates[index + 1];

    if (coveredLength + currentSegmentLength <= targetLength) {
      visibleCoordinates.push(segmentEnd);
      coveredLength += currentSegmentLength;
      continue;
    }

    const segmentStart = coordinates[index];
    const remainingLength = targetLength - coveredLength;
    const segmentProgress = currentSegmentLength === 0
      ? 0
      : remainingLength / currentSegmentLength;

    visibleCoordinates.push([
      segmentStart[0] + (segmentEnd[0] - segmentStart[0]) * segmentProgress,
      segmentStart[1] + (segmentEnd[1] - segmentStart[1]) * segmentProgress,
    ]);
    break;
  }

  return visibleCoordinates.length === 1
    ? [visibleCoordinates[0], visibleCoordinates[0]]
    : visibleCoordinates;
}
