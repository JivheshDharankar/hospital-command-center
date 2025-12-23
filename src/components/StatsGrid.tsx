interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: '4 hospitals simulated', label: 'City-wide view across emergency and OPD.' },
  { value: '3 critical units', label: 'Emergency, Cardiology, Neurology.' },
  { value: 'Under 60 seconds', label: 'From symptom entry to triage decision in the demo.' },
];

export function StatsGrid() {
  return (
    <section className="container mx-auto px-4 md:px-8 -mt-6 relative z-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-accent rounded-2xl p-5 transition-all duration-300 hover:bg-accent/80 hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="font-semibold text-foreground mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
