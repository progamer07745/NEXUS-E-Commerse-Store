const Footer = () => {
  return (
    <footer className="w-full bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4">
        <div>
          <div className="font-bold text-xl text-white mb-4">NEXUS</div>
          <p className="text-sm text-slate-400">A modern marketplace for premium essentials.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400 mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>Collections</li>
            <li>About</li>
            <li>Contact</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400 mb-3">Support</h4>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>Shipping</li>
            <li>Returns</li>
            <li>Customer care</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400 mb-3">Newsletter</h4>
          <div className="flex items-center gap-2 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3">
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500"
            />
            <button className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">Join</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
