import { Icon } from "@/components/ui/icon";
import type { MenuItem } from "@/lib/menu/types";

import { MenuLink } from "./menu-link";

import styles from "./quick-links.module.css";

const MAX_COLUMNS = 5;

export function QuickLinks({ items }: { items: MenuItem[] }) {
  return (
    <ul className={styles.root}>
      {items.map((item) => (
        <NavItem key={item.id} item={item} />
      ))}
    </ul>
  );
}

function NavItem({ item }: { item: MenuItem }) {
  if (item.items.length === 0) {
    return (
      <li className={styles.item} data-numbers-id={`nav_${item.title.toLowerCase()}`}>
        <MenuLink url={item.url} className={styles.trigger}>
          {item.title}
        </MenuLink>
      </li>
    );
  }

  const columns = item.items.slice(0, MAX_COLUMNS);

  return (
    <li className={styles.item}>
      <MenuLink url={item.url} className={styles.trigger}>
        {item.title}
        <Icon name="chevron-down" size={12} />
      </MenuLink>
      <div className={styles.dropdown}>
        <div className={styles.dropdownInner}>
          <div className={styles.columns}>
            {columns.map((column) => (
              <div key={column.id}>
                {column.url ? (
                  <MenuLink url={column.url} className={styles.columnLink}>
                    {column.title}
                  </MenuLink>
                ) : (
                  <h3 className={styles.columnTitle}>{column.title}</h3>
                )}
                {column.items.length > 0 && (
                  <ul className={styles.leaves}>
                    {column.items.map((leaf) => (
                      <li key={leaf.id}>
                        <MenuLink url={leaf.url} className={styles.leafLink}>
                          {leaf.title}
                        </MenuLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
}
