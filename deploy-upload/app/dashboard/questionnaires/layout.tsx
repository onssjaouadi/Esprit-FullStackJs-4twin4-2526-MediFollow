import { ReactNode } from "react";
import DoctorLayout from "../doctor/layout";

export default function QuestionnairesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DoctorLayout>{children}</DoctorLayout>;
}
