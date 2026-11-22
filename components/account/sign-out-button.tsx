import { Button } from "@/components/ui/button";

import styles from "./sign-out-button.module.css";

export function SignOutButton() {
  return (
    <form action="/account/logout?return_to=/" method="post">
      <Button className={styles.button} size="sm" type="submit" variant="outline">
        Sign out
      </Button>
    </form>
  );
}
