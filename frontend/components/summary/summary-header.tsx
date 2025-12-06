export default function SummaryHeader({ title }: { title: string }) {
    return (
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-center text-rose-600">
            {title}
        </h1>
    );
}