import { ShieldCheck, BadgePercent, Truck } from "lucide-react";

// Shared left panel for Login and Register so both pages look identical.
export default function AuthArt({ title, text }) {
    return (
        <aside className="auth-art">
            <span className="eyebrow light">CSD AFD Online</span>
            <h2>{title}</h2>
            <p className="auth-art-txt">{text}</p>
            <div className="auth-art-img">
                <img
                    src="/assets/login.png"
                    alt="Armed forces personnel from the Army, Navy and Air Force"
                />
            </div>
            <ul className="auth-perks">
                <li>
                    <ShieldCheck size={18} aria-hidden /> Secure OTP verified access
                </li>
                <li>
                    <BadgePercent size={18} aria-hidden /> Tax-advantaged canteen prices
                </li>
                <li>
                    <Truck size={18} aria-hidden /> Delivery across India
                </li>
            </ul>
        </aside>
    );
}