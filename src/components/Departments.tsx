const departments = [
  { name: 'Emergency', tag: 'Red & yellow triage' },
  { name: 'Cardiology', tag: 'Chest pain & MI' },
  { name: 'Neurology', tag: 'Stroke window' },
  { name: 'General Medicine', tag: 'Routine OPD' },
];

export function Departments() {
  return (
    <section className="container mx-auto px-4 md:px-8 py-12">
      <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-1">Key Departments</h2>
      <div className="w-11 h-0.5 bg-primary rounded-full mb-3" />
      <p className="text-sm text-muted-foreground mb-6">Focus on service lines where delays are most dangerous.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {departments.map((dept) => (
          <div
            key={dept.name}
            className="bg-accent rounded-xl p-4 flex items-center justify-between transition-all duration-300 hover:bg-accent/80 hover:-translate-y-1 hover:shadow-lg"
          >
            <span className="font-medium">{dept.name}</span>
            <span className="text-xs px-3 py-1 bg-primary/10 text-primary-dark rounded-full">
              {dept.tag}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
