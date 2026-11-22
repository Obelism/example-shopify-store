import styles from "./page-header.module.css";

export function AccountPageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h1 className={styles.title}>{title}</h1>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}
