interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 text-ink-muted">Esta sección se implementará en una fase posterior.</p>
    </section>
  );
}
