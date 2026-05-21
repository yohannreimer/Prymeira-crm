import { SaveButton } from "@/components/admin/form";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  EditBase,
  Form,
  useEditContext,
  useNotify,
  useRedirect,
  useResourceContext,
  useTranslate,
  type EditBaseProps,
  type FormProps,
} from "ra-core";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EditSheetProps extends EditBaseProps {
  /**
   * The children elements that will be rendered inside the sheet as form inputs
   */
  children: ReactNode;

  /**
   * Controls whether the sheet is open
   */
  open: boolean;

  /**
   * Callback fired when the sheet open state changes
   */
  onOpenChange: (open: boolean) => void;

  /**
   * The title displayed in the sheet header
   */
  title?: ReactNode;

  /**
   * Default values for the form
   */
  defaultValues?: FormProps["defaultValues"];

  /**
   * Optional actions to render in the sheet header, next to the title
   */
  headerActions?: ReactNode;
}

/**
 * A Sheet component that contains an edit form with externally controlled open state.
 *
 * Renders a Sheet containing an EditBase form. The sheet has a fixed footer with Save and Delete buttons.
 * The open state is controlled externally via the open and onOpenChange props. The sheet will automatically
 * close itself on successful submission (if redirect is false) or when the Delete/Close actions are triggered.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * return (
 *   <>
 *     <Button onClick={() => setOpen(true)}>Edit Contact</Button>
 *     <EditSheet
 *       resource="contacts"
 *       id={contactId}
 *       title="Edit Contact"
 *       open={open}
 *       onOpenChange={setOpen}
 *     >
 *       <TextInput source="first_name" />
 *       <TextInput source="last_name" />
 *       <TextInput source="email" />
 *     </EditSheet>
 *   </>
 * );
 * ```
 */
export const EditSheet = ({
  children,
  open,
  onOpenChange,
  title,
  redirect: redirectTo = "show",
  mutationOptions,
  mutationMode = "undoable",
  defaultValues,
  headerActions,
  ...editBaseProps
}: EditSheetProps) => {
  const resource = useResourceContext(editBaseProps);
  const translate = useTranslate();
  const notify = useNotify();
  const redirect = useRedirect();

  // Handle success - close sheet in addition to default behavior
  const handleSuccess = (...args: any[]) => {
    if (mutationOptions?.onSuccess) {
      return mutationOptions.onSuccess(
        ...(args as Parameters<typeof mutationOptions.onSuccess>),
      );
    }
    const [data] = args;
    notify(`resources.${resource}.notifications.updated`, {
      type: "info",
      messageArgs: {
        smart_count: 1,
        _: translate(`ra.notification.updated`, {
          smart_count: 1,
        }),
      },
      undoable: mutationMode === "undoable",
    });
    redirect(redirectTo, resource, data.id, data);
    onOpenChange(false);
  };

  const enhancedMutationOptions = {
    ...mutationOptions,
    onSuccess: handleSuccess,
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[360px] sm:w-[400px] flex flex-col p-0"
        aria-describedby={undefined}
      >
        <EditBase
          {...editBaseProps}
          redirect={redirectTo}
          mutationOptions={enhancedMutationOptions}
          mutationMode={mutationMode}
        >
          <Form
            defaultValues={defaultValues}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <SheetHeader className="border-b px-5 py-4">
              <div
                className={cn(
                  "flex items-center gap-2",
                  headerActions && "pr-8",
                )}
              >
                <SheetTitle className="min-w-0 flex-1 truncate">
                  <EditSheetTitle title={title} />
                </SheetTitle>
                {headerActions && (
                  <div className="shrink-0">{headerActions}</div>
                )}
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-5 py-4">
              {children}
            </div>

            <SheetFooter className="border-t px-5 py-3 flex flex-row gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                {translate("ra.action.cancel")}
              </button>
              <SaveButton className="flex-1" />
            </SheetFooter>
          </Form>
        </EditBase>
      </SheetContent>
    </Sheet>
  );
};

const EditSheetTitle = ({ title }: { title?: ReactNode | string | false }) => {
  const { defaultTitle } = useEditContext();

  if (title === false) {
    return null;
  }

  const resolvedTitle = title === undefined ? defaultTitle : title;
  if (resolvedTitle == null) {
    return null;
  }

  return typeof resolvedTitle === "string" ? (
    <span className="text-[16px] font-semibold text-foreground">
      {resolvedTitle}
    </span>
  ) : (
    resolvedTitle
  );
};
