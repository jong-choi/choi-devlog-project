"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { GlassButton } from "@/components/ui/glass-button";
import { Input } from "@/components/ui/input";
import {
  type DeleteConfirmForm,
  DeleteConfirmSchema,
} from "@/types/form-schemas";

type DeleteFormProps = {
  onConfirm: () => Promise<void>;
  onClose?: () => void;
  entityLabel?: string;
  buttonText?: string;
};

export default function DeleteForm({
  onConfirm,
  onClose,
  entityLabel,
  buttonText = "삭제",
}: DeleteFormProps) {
  const form = useForm<DeleteConfirmForm>({
    resolver: zodResolver(DeleteConfirmSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    delayError: 500,
    shouldFocusError: false,
    defaultValues: {},
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = useCallback(async () => {
    setIsSaving(true);
    try {
      await onConfirm();
      onClose?.();
    } finally {
      setIsSaving(false);
    }
  }, [onConfirm, onClose]);

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4 p-2"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        {entityLabel ? <div className="text-sm">{entityLabel}</div> : null}
        <div className="text-sm">
          삭제하시려면 <strong>지금 삭제</strong> 라고 입력해주세요.
        </div>
        <div className="grid grid-cols-5 gap-2">
          <FormField
            name="confirm"
            render={({ field }) => (
              <FormItem className="col-span-4">
                <FormControl>
                  <Input
                    placeholder="지금 삭제"
                    autoComplete="off"
                    value={typeof field.value === "string" ? field.value : ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <GlassButton
            className="col-span-1"
            variant="danger"
            loading={isSaving}
            disabled={isSaving || !form.formState.isValid}
            type="submit"
          >
            {buttonText}
          </GlassButton>
        </div>
      </form>
    </Form>
  );
}
