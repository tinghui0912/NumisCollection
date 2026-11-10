import { motion } from "framer-motion";

export default function StatCard({ title, value, subtitle, icon: Icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-body text-muted-foreground tracking-wide uppercase">{title}</p>
          <p className="text-3xl font-heading font-bold mt-2 text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1 font-body">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="p-3 rounded-xl bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>
    </motion.div>
  );
}