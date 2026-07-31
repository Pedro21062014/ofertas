interface LogoProps {
  size?: number;
  className?: string;
}

const LOGO_URL = "https://cdn.fbsbx.com/v/t65.102178-21/763211331_1381154730622332_2962590640055488380_n.jpg/logo-shopee.webp?_nc_ht=cdn.fbsbx.com&_nc_ohc=AT-z-SbCEnsQ7kNvwHcP2WE&sdl=0&ccb=14-4&oh=00_AQFgVShx89vEFSw5jNoY4AG-U7DALrWeWelEzAbm2rDAXg&oe=6A6EBD9B&_nc_sid=4ee932";

/**
 * Achados da Shopee — logo image mark.
 * Uses the official Shopee logo image.
 */
export function LogoMark({ size = 40, className = "" }: LogoProps) {
  return (
    <img
      src={LOGO_URL}
      alt="Achados da Shopee"
      width={size}
      height={size}
      className={`shrink-0 object-contain ${className}`}
      style={{ borderRadius: size >= 36 ? 22 : 14 }}
    />
  );
}

/** Full lockup: mark + wordmark */
export function Logo({
  size = 40,
  dark = false,
  className = "",
}: {
  size?: number;
  dark?: boolean;
  className?: string;
}) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <LogoMark size={size} className="shadow-lg shadow-[#F5341A]/20" />
      <span className="flex flex-col leading-none">
        <span
          className={`font-serif text-xl md:text-[1.6rem] tracking-[-0.02em] leading-none ${
            dark ? "text-stone-50" : "text-stone-950"
          }`}
        >
          Achados <span className="italic font-normal text-[#F5341A]">da Shopee</span>
        </span>
      </span>
    </span>
  );
}
