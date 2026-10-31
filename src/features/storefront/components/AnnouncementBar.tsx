import { ANNOUNCEMENT } from '../data/content';

export default function AnnouncementBar() {
  return (
    <div className="bg-surface-secondary text-text-primary">
      <p className="type-caption page-container py-2 text-center tracking-[0.08em]">{ANNOUNCEMENT}</p>
    </div>
  );
}
