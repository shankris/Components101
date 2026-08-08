import styles from "./ProfilePic.module.css";

function getInitials(firstName, lastName) {
  const first = firstName?.trim()?.[0] || "";
  const last = lastName?.trim()?.[0] || "";

  return `${first}${last}`.toUpperCase();
}

function getColorFromName(name) {
  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;

  return `hsl(${hue}, 60%, 55%)`;
}

export default function ProfilePic({ first_name, last_name, pic }) {
  const fullName = `${first_name || ""} ${last_name || ""}`.trim();

  // If a picture exists, show it
  if (pic) {
    return (
      <img
        src={pic}
        alt={fullName}
        className={styles.avatar}
      />
    );
  }

  // Otherwise show initials
  const initials = getInitials(first_name, last_name);
  const backgroundColor = getColorFromName(fullName);

  return (
    <div
      className={styles.avatar}
      style={{ backgroundColor }}
      title={fullName}
    >
      {initials}
    </div>
  );
}
