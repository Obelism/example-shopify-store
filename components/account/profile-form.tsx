"use client";

import { type FormEvent, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction } from "@/lib/customer/action";
import type { CustomerProfile } from "@/lib/customer/types";

import styles from "./profile-form.module.css";

interface ProfileFormLabels {
  email: string;
  firstName: string;
  lastName: string;
  profileUpdated: string;
  save: string;
}

export function ProfileForm({
  labels,
  profile,
}: {
  labels: ProfileFormLabels;
  profile: CustomerProfile;
}) {
  const [firstName, setFirstName] = useState(profile.firstName ?? "");
  const [lastName, setLastName] = useState(profile.lastName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaved(false);

    startTransition(async () => {
      const result = await updateProfileAction({ firstName, lastName });
      if (result.success) {
        setSaved(true);
      } else {
        setError(result.error ?? null);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.names}>
        <div className={styles.field}>
          <Label htmlFor="firstName">{labels.firstName}</Label>
          <Input
            id="firstName"
            name="firstName"
            value={firstName}
            onChange={(event) => {
              setFirstName(event.target.value);
              setSaved(false);
            }}
            autoComplete="given-name"
          />
        </div>
        <div className={styles.field}>
          <Label htmlFor="lastName">{labels.lastName}</Label>
          <Input
            id="lastName"
            name="lastName"
            value={lastName}
            onChange={(event) => {
              setLastName(event.target.value);
              setSaved(false);
            }}
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className={styles.field}>
        <Label htmlFor="email">{labels.email}</Label>
        <Input id="email" type="email" value={profile.email} disabled autoComplete="email" />
      </div>

      {error ? (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}

      <div className={styles.actions}>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Icon name="loader-circle" size={16} className={styles.spinner} />
          ) : (
            labels.save
          )}
        </Button>
        {saved ? <span className={styles.saved}>{labels.profileUpdated}</span> : null}
      </div>
    </form>
  );
}
