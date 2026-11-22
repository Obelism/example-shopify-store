"use client";

import { useState } from "react";

import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Sheet } from "@/components/ui/sheet";
import type { MenuItem } from "@/lib/menu/types";

import { MenuLink } from "./menu-link";

import styles from "./mobile-menu.module.css";

export function MobileMenu({ items }: { items: MenuItem[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Menu"
        className={styles.trigger}
        onClick={() => setOpen(true)}
        type="button"
      >
        <Icon name="menu" size={20} />
      </button>
      <Sheet className={styles.sheet} onOpenChange={setOpen} open={open} side="left">
        <div className={styles.header}>
          <DialogTitle className={styles.title}>Menu</DialogTitle>
        </div>
        <nav className={styles.body}>
          <MobileMenuList items={items} onLinkClick={close} />
        </nav>
      </Sheet>
    </>
  );
}

function MobileMenuList({ items, onLinkClick }: { items: MenuItem[]; onLinkClick: () => void }) {
  const hasAnyChildren = items.some((item) => item.items.length > 0);

  if (!hasAnyChildren) {
    return (
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <MenuLink url={item.url} onClick={onLinkClick} className={styles.link}>
              {item.title}
            </MenuLink>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={styles.accordion}>
      {items.map((item) =>
        item.items.length > 0 ? (
          <AccordionItem key={item.id}>
            <AccordionTrigger className={styles.accordionTrigger}>{item.title}</AccordionTrigger>
            <AccordionContent>
              <NestedItems items={item.items} onLinkClick={onLinkClick} />
              {item.url ? (
                <MenuLink url={item.url} onClick={onLinkClick} className={styles.showAll}>
                  {`Show all ${item.title}`}
                </MenuLink>
              ) : null}
            </AccordionContent>
          </AccordionItem>
        ) : (
          <div key={item.id} className={styles.row}>
            <MenuLink url={item.url} onClick={onLinkClick} className={styles.rowLink}>
              {item.title}
            </MenuLink>
          </div>
        ),
      )}
    </div>
  );
}

function NestedItems({ items, onLinkClick }: { items: MenuItem[]; onLinkClick: () => void }) {
  return (
    <ul className={styles.nested}>
      {items.map((item) => (
        <li key={item.id} className={styles.nestedItem}>
          <MenuLink url={item.url} onClick={onLinkClick} className={styles.nestedLink}>
            {item.title}
          </MenuLink>
          {item.items.length > 0 && (
            <ul className={styles.leaves}>
              {item.items.map((leaf) => (
                <li key={leaf.id}>
                  <MenuLink url={leaf.url} onClick={onLinkClick} className={styles.leafLink}>
                    {leaf.title}
                  </MenuLink>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
