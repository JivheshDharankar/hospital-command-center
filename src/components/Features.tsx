const features = [
  { title: 'Triage Intelligence', description: 'Scores symptoms and assigns patients to Emergency, Cardiology, Neurology, or OPD.' },
  { title: 'Capacity-aware Routing', description: 'Considers beds, ICU, and doctors before new cases are accepted.' },
  { title: 'Clean Operational View', description: 'Designed to fit into hospital control rooms and MIS dashboards.' },
];

export function Features() {
  return (
    <section className="container mx-auto px-4 md:px-8 py-12">
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-1">AI That Stays Under Hospital Control</h2>
          <div className="w-11 h-0.5 bg-primary rounded-full mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Clear rules, transparent queues, and a layout that feels familiar to staff at hospitals like Ruby Hall.
          </p>
          <p className="text-sm text-muted-foreground">
            Instead of a black-box model, MediQueue AI uses explainable rules and capacity data
            so every routing decision can be traced and audited by operations or clinical leads.
          </p>
        </div>
        
        <div className="grid gap-4">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-accent rounded-xl p-5 transition-all duration-300 hover:bg-accent/80 hover:-translate-y-1 hover:shadow-lg"
            >
              <h4 className="font-semibold mb-1">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
