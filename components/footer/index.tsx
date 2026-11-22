import { MenuLink } from "@/components/nav/menu-link";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Sections } from "@/components/ui/sections";
import type { MenuItem } from "@/lib/menu/types";
import { getShopPolicies } from "@/lib/policies/server";

import { SocialLinks } from "./social-links";
import type { SocialLink } from "./social-links";

import styles from "./index.module.css";

export async function Footer() {
  const socialLinks: SocialLink[] = [];
  const items: MenuItem[] = [];
  const policies = await getShopPolicies({}).catch(() => []);
  return (
    <footer>
      <Container className={styles.container}>
        <Sections>
          {items.length > 0 && <FooterMenu items={items} />}
          <div className={styles.bottom}>
            <div className={styles.policies}>
              {policies.map((policy) => (
                <Link
                  key={policy.handle}
                  href={`/policies/${policy.handle}`}
                  className={styles.policy}
                >
                  {policy.title}
                </Link>
              ))}
            </div>
            {socialLinks.length > 0 && <SocialLinks links={socialLinks} />}
          </div>
        </Sections>
      </Container>
    </footer>
  );
}

function FooterMenu({ items }: { items: MenuItem[] }) {
  const columns = items.slice(0, 5);

  return (
    <div className={styles.menu}>
      {columns.map((column) => (
        <div key={column.id} className={styles.column}>
          {column.url ? (
            <MenuLink url={column.url} className={styles.columnLink}>
              {column.title}
            </MenuLink>
          ) : (
            <h3 className={styles.columnTitle}>{column.title}</h3>
          )}
          {column.items.length > 0 && (
            <ul className={styles.links}>
              {column.items.map((leaf) => (
                <li key={leaf.id}>
                  <MenuLink url={leaf.url} className={styles.link}>
                    {leaf.title}
                  </MenuLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
