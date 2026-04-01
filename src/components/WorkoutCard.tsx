interface WorkoutCardProps {
  image: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  className?: string;
  wide?: boolean;
}

const WorkoutCard = ({ image, title, subtitle, onClick, className = "", wide }: WorkoutCardProps) => (
  <button
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl group active:scale-[0.98] transition-transform ${
      wide ? "w-full aspect-[16/9]" : "w-40 h-48 flex-shrink-0"
    } ${className}`}
  >
    <img
      src={image}
      alt={title}
      loading="lazy"
      className="absolute inset-0 w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
      <h3 className="text-primary-foreground font-black text-sm uppercase tracking-tight leading-tight">
        {title}
      </h3>
      {subtitle && (
        <p className="text-primary-foreground/70 text-xs mt-1 font-medium">{subtitle}</p>
      )}
    </div>
  </button>
);

export default WorkoutCard;
