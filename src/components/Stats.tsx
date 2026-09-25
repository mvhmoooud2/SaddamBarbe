import { Users, Scissors, Award, Clock } from "lucide-react";

const stats = [
  { icon: Users, value: "5000+", label: "عميل سعيد" },
  { icon: Scissors, value: "15+", label: "سنة خبرة" },
  { icon: Award, value: "20+", label: "جائزة" },
  { icon: Clock, value: "12", label: "ساعة عمل يومياً" },
];

export default function Stats() {
  return (
    <section className="border-y border-[#c9a227]/20 bg-[#0f0f0f] py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <stat.icon className="mx-auto mb-4 h-8 w-8 text-[#c9a227]" />
              <div className="text-3xl font-bold text-[#f5f0e6]">{stat.value}</div>
              <div className="mt-1 text-sm text-[#f5f0e6]/60">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
