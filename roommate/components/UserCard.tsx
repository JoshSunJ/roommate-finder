type Props = {
    name: string;
    major: string;
};

export default function UserCard({
                                     name,
                                     major,
                                 }: Props) {
    return (
        <div>
            <h3>{name}</h3>
            <p>{major}</p>
        </div>
    );
}