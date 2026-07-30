type Props = {
    name: string,
    major: string,
    budget: number
}

export default function ProfileCard({
                                        name,
                                        major,
                                        budget
                                    }: Props) {
    return (
        <div>
            <h3>{name}</h3>
            <p>{major}</p>
            <p>{budget}</p>
        </div>
    );
}
