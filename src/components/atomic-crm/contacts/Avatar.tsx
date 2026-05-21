import {
  AvatarFallback,
  AvatarImage,
  Avatar as ShadcnAvatar,
} from "@/components/ui/avatar";
import { useRecordContext } from "ra-core";

import type { Contact } from "../types";

export const Avatar = (props: {
  record?: Contact;
  width?: 20 | 25 | 40 | 56;
  height?: 20 | 25 | 40 | 56;
  title?: string;
}) => {
  const record = useRecordContext<Contact>(props);
  if (!record?.avatar && !record?.first_name && !record?.last_name) {
    return null;
  }

  const size = props.width || props.height;
  const sizeClass =
    props.width === 20
      ? "w-[20px] h-[20px]"
      : props.width === 25
        ? "w-[25px] h-[25px]"
        : props.width === 56
          ? "w-[56px] h-[56px]"
          : "w-10 h-10";

  const textClass =
    size && size <= 20 ? "text-[10px]" : size === 56 ? "text-lg" : "text-sm";

  return (
    <ShadcnAvatar className={sizeClass} title={props.title}>
      <AvatarImage src={record.avatar?.src ?? undefined} />
      <AvatarFallback className={textClass}>
        {record.first_name?.charAt(0).toUpperCase()}
        {record.last_name?.charAt(0).toUpperCase()}
      </AvatarFallback>
    </ShadcnAvatar>
  );
};
