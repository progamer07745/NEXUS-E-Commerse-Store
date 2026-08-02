const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-200 bg-slate-50 text-slate-700">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        <div>
          <div className="font-bold text-xl text-slate-900 mb-4">NEXUS</div>
          <p className="text-sm text-slate-500">A modern marketplace for premium essentials.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>Collections</li>
            <li>About</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 mb-3">Support</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>Shipping</li>
            <li>Returns</li>
            <li>Customer care</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 mb-3">Newsletter</h4>
          <div className="flex items-center gap-2 rounded-3xl border border-slate-300 bg-white px-4 py-3">
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">Join</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
