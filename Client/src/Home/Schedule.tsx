import React from 'react';
import SectionHeading from '../components/ui/SectionHeading';
import Badge from '../components/ui/Badge';

const Schedule = () => {
  const schedule = [
    { name: "Morning Batch", time: "10 AM - 12 PM", mode: "Offline", seats: 12 },
    { name: "Evening Batch", time: "5 PM - 7 PM", mode: "Offline", seats: 10 },
    { name: "Weekend Batch", time: "Sat - Sun 11 AM", mode: "Hybrid", seats: 15 },
    { name: "Online Live Batch", time: "8 PM - 9:30 PM", mode: "Online", seats: "Unlimited" },
  ];

  return (
    <section className="py-24 bg-brand-light">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading 
          title="Class Schedule" 
          subtitle="Flexible timings tailored to fit your busy lifestyle." 
        />

        <div className="bg-white rounded-3xl shadow-xl border border-brand-gold/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-dark text-brand-gold">
                  <th className="p-6 font-semibold text-sm uppercase tracking-widest">Batch</th>
                  <th className="p-6 font-semibold text-sm uppercase tracking-widest">Timing</th>
                  <th className="p-6 font-semibold text-sm uppercase tracking-widest">Mode</th>
                  <th className="p-6 font-semibold text-sm uppercase tracking-widest text-center">Seats</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-light text-brand-dark">
                {schedule.map((row, i) => (
                  <tr key={i} className="hover:bg-brand-light/50 transition-colors group">
                    <td className="p-6 font-medium group-hover:text-brand-gold transition-colors">{row.name}</td>
                    <td className="p-6 text-brand-brown">{row.time}</td>
                    <td className="p-6">
                      <Badge 
                        variant={row.mode === 'Offline' ? 'gold' : row.mode === 'Online' ? 'dark' : 'outline'}
                      >
                        {row.mode}
                      </Badge>
                    </td>
                    <td className="p-6 text-brand-brown text-center font-semibold">{row.seats}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Schedule;
