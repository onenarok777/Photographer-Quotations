export type DropdownPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "left-top"
  | "left-center"
  | "left-bottom"
  | "right-top"
  | "right-center"
  | "right-bottom"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type DropdownItem = {
  label?: string;
  action?: () => void;
};

export interface DropdownProps {
  position?: DropdownPosition;
  items?: DropdownItem[];
}
