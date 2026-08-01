const Hero = () => {
  const scrollToProducts = () => {
    document
      .getElementById("products-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative pt-16 pb-20 px-6 md:px-12 max-w-[1280px] mx-auto flex flex-col-reverse md:flex-row items-center gap-12 text-left"
      dir="ltr"
    >
      <div className="flex-1 space-y-6 z-10 w-full">
        <h1 className="text-4xl md:text-6xl font-bold text-[#172820] leading-tight tracking-tight">
          Timeless Essentials.
          <br />
          Modern Living.
        </h1>
        <p className="text-lg text-[#424844] max-w-md leading-relaxed">
          Curated artifacts for modern living. Embracing quiet luxury through intentional design and uncompromising craftsmanship.
        </p>
        <button
          onClick={scrollToProducts}
          className="bg-[#2c3e35] text-white px-8 py-4 rounded-full font-medium hover:bg-[#172820] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 inline-block mt-4"
        >
          Explore Collection
        </button>
      </div>

      <div className="flex-1 w-full">
        <div className="aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden shadow-sm bg-[#f0edec]">
          <img
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1000&auto=format&fit=crop"
            alt="Quiet Luxury"
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
