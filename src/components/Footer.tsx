export default function Footer() {
  return (
    <footer className="px-6 py-10 border-t border-border-soft">
      <div className="max-w-3xl mx-auto flex items-center justify-between font-ui text-xs tracking-widest uppercase text-text-dim">
        <span>Naveen Toastmasters Journey</span>
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}