/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { User } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import z, { set } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { userService } from "@/services/user.service";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown, Eye, EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { classService } from "@/services/class.service";
import { cardService } from "@/services/card.service";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z
  .object({
    uid: z.string().min(1, "UID harus diisi."),
    status: z.string().min(1, "Status harus diisi."),
    keterangan: z.string(),
    userId: z.string(),
    kelasId: z.string(),
  })
  .refine(
    (data) => {
      // Kondisi 1: Pastikan salah satu (userId atau kelasId) terisi (tidak kosong).
      const isUserIdFilled = data.userId && data.userId.length > 0;
      const isKelasIdFilled = data.kelasId && data.kelasId.length > 0;

      // Kondisi 2: Pastikan TIDAK KEDUANYA terisi.

      // Logika: (isUserIdFilled XOR isKelasIdFilled)
      // Ini berarti: (Benar dan Tidak Salah) OR (Salah dan Benar)
      // Yaitu: Hanya satu yang true, yang lain false.
      return (
        (isUserIdFilled && !isKelasIdFilled) ||
        (!isUserIdFilled && isKelasIdFilled)
      );
    },
    {
      // Pesan error jika kondisi di atas gagal
      message:
        "Wajib memilih salah satu antara Pemilik (User ID) atau Kelas, tidak boleh keduanya.",
      // Terapkan error pada kedua field agar user tahu field mana yang bermasalah
      path: ["userId"], // Menargetkan field userId
    }
  )
  .refine(
    (data) => {
      // Kondisi refine kedua untuk menargetkan field kelasId
      const isUserIdFilled = data.userId && data.userId.length > 0;
      const isKelasIdFilled = data.kelasId && data.kelasId.length > 0;

      return (
        (isUserIdFilled && !isKelasIdFilled) ||
        (!isUserIdFilled && isKelasIdFilled)
      );
    },
    {
      message:
        "Wajib memilih salah satu antara Pemilik atau Kelas, tidak boleh keduanya.",
      path: ["kelasId"], // Menargetkan field kelasId
    }
  );

export type FormValues = z.infer<typeof formSchema>;

interface CardFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: any | null;
}

export default function CardForm({
  isOpen,
  onClose,
  initialData,
}: CardFormProps) {
  const queryClient = useQueryClient();
  const isEditMode = !!initialData;

  const initialJenisPemilik = initialData?.userId ? "user" : "kelas";

  const [isUserIdComboOpen, setIsUserIdComboOpen] = useState(false);
  const [isKelasIdComboOpen, setIsKelasIdComboOpen] = useState(false);
  const [jenisPemilik, setJenisPemilik] = useState(initialJenisPemilik);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uid: initialData?.uid || "",
      status: initialData?.status || "AKTIF",
      keterangan: initialData?.keterangan || "",
      userId:
        initialJenisPemilik === "user" && initialData?.userId
          ? String(initialData.userId)
          : "",
      kelasId:
        initialJenisPemilik === "kelas" && initialData?.kelasId
          ? String(initialData.kelasId)
          : "",
    },
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
  });

  const { data: classes } = useQuery({
    queryKey: ["kelas"],
    queryFn: () => classService.getAll(),
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.setValue("uid", initialData.uid);
        form.setValue("status", initialData.status);
        form.setValue("keterangan", initialData.keterangan);
        form.setValue("userId", String(initialData.userId));
        form.setValue("kelasId", String(initialData.kelasId));
      } else {
        form.reset();
      }
    }
  }, [form, isOpen, initialData]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const valuesToSubmit = {
        ...values,
        userId: values.userId !== "" ? Number(values.userId) : 0,
        kelasId: values.kelasId !== "" ? Number(values.kelasId) : 0,
      };

      console.log(valuesToSubmit)

      if (isEditMode) {
        await cardService.update(String(initialData.id), valuesToSubmit);
      } else {
        await cardService.create(valuesToSubmit);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success(
        `Berhasil ${isEditMode ? "mengupdate" : "membuat"} data kartu!`
      );
      onClose();
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data.message || "Terjadi kesalahan!");
      }
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values);
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Kartu" : "Tambah Kartu"}
          </DialogTitle>
          <DialogDescription>
            Masukkan detail kartu untuk di {isEditMode ? "edit" : "buat"}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="uid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UID Kartu</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Masukkan UID atau ID Kartu..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent position="popper">
                      <SelectItem value="AKTIF">Aktif</SelectItem>
                      <SelectItem value="NONAKTIF">Tidak Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keterangan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Masukkan keterangan..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2">
              <Label htmlFor="radioJenis">Jenis Pemilik</Label>
              <RadioGroup
                id="radioJenis"
                className="flex gap-2"
                defaultValue="kelas"
                onValueChange={(val) => {
                  setJenisPemilik(val);
                  if (val === "kelas") {
                    // Jika memilih Kelas, reset userId
                    form.setValue("userId", "", { shouldValidate: true });
                  } else {
                    // Jika memilih User, reset kelasId
                    form.setValue("kelasId", "", { shouldValidate: true });
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="kelas" id="kelas" />
                  <Label htmlFor="kelas">Kelas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user">User</Label>
                </div>
              </RadioGroup>
            </div>

            {jenisPemilik === "kelas" ? (
              <FormField
                control={form.control}
                name="kelasId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih Kelas</FormLabel>
                    <Popover
                      open={isKelasIdComboOpen}
                      onOpenChange={setIsKelasIdComboOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={isKelasIdComboOpen}
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value !== ""
                              ? classes.data?.find(
                                  (kelas: any) =>
                                    kelas.id === Number(field.value)
                                )?.nama
                              : "Pilih kelas..."}
                            <ChevronsUpDown />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Cari kelas berdasarkan nama..." />
                          <CommandList>
                            <CommandEmpty>
                              Tidak ada kelas / kelas tidak ditemukan.
                            </CommandEmpty>
                            <CommandGroup>
                              {classes.data?.map((kelas: any) => (
                                <CommandItem
                                  value={kelas.nama}
                                  key={kelas.id}
                                  onSelect={() => {
                                    form.setValue("kelasId", String(kelas.id));
                                    setIsKelasIdComboOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      String(kelas.id) === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {kelas.nama}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih User</FormLabel>
                    <Popover
                      open={isUserIdComboOpen}
                      onOpenChange={setIsUserIdComboOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={isUserIdComboOpen}
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value !== ""
                              ? users.data?.find(
                                  (user: any) => user.id === Number(field.value)
                                )?.username
                              : "Pilih user..."}
                            <ChevronsUpDown />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Cari user berdasarkan username..." />
                          <CommandList>
                            <CommandEmpty>
                              Tidak ada user / user tidak ditemukan.
                            </CommandEmpty>
                            <CommandGroup>
                              {users.data?.map((user: any) => (
                                <CommandItem
                                  value={user.username}
                                  key={user.id}
                                  onSelect={() => {
                                    form.setValue("userId", String(user.id));
                                    setIsUserIdComboOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      String(user.id) === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {user.username}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter className="flex justify-end pt-2">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Spinner />}
                {mutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
