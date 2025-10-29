"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "../Button";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import NotificationTable from "../Tables/NotificationTable";
import { useEffect, useState } from "react";
import { User } from "@/types";
import AddUserToPushNotificationList from "../AddUserToPushNotificationList";
import { getDevices } from "@/functions/devices/list-devices";
import { getUser } from "@/functions/user/get-user";
import { toast } from "react-toastify";
import { getUserById } from "@/functions/user/get-user-by-id";
import { ConfirmationDialog } from "../ConfirmationDialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function NotificationForm() {
  const [allUsers, setAllUsers] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [statusOptions, setStatusOptions] = useState({
    Regular: false,
    Roubado: false,
    Furtado: false,
    Perdido: false,
    Recuperado: false,
  });
  const [locationOptions, setLocationOptions] = useState({
    JoaoPessoa: false,
    Cabedelo: false,
    CampinaGrande: false,
    Bayeux: false,
    SantaRita: false,
  });
  const [refresh, setRefresh] = useState(false);

  const formSchema = z.object({
    title: z
      .string()
      .min(1, {
        message: "O título é obrigatório.",
      })
      .max(65, "O título deve ter no máximo 65 caracteres"),
    description: z
      .string()
      .min(1, {
        message: "O corpo da notificação é obrigatória.",
      })
      .max(240, "O corpo da notificação deve ter no máximo 240 caracteres"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  async function restoreFilterFromHistory({
    is_all_users_checked,
    selected_targets,
    device_options,
    location_options,
  }: {
    is_all_users_checked: boolean;
    selected_targets: string[];
    device_options: string[];
    location_options: string[];
  }) {
    setAllUsers(is_all_users_checked);
    statusOptions &&
      setStatusOptions(
        device_options.reduce((acc, option) => {
          acc[option] = true;
          return acc;
        }, {}),
      );
    locationOptions &&
      setLocationOptions(
        location_options.reduce((acc, option) => {
          acc[option] = true;
          return acc;
        }, {}),
      );

    let users: User[] = [];

    for (let target of selected_targets) {
      const user = await getUserById(target);
      users.push(user);
    }

    setSelectedUsers(users);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const statusTarget = Object.keys(statusOptions).filter(
      (key) => statusOptions[key] === true,
    );
    const locationTarget = Object.keys(locationOptions).filter(
      (key) => locationOptions[key] === true,
    );

    // console.log("statusTarget", statusTarget)

    const queryFiltersDevices =
      statusTarget.length > 0
        ? [
            {
              method: "equal",
              attribute: "status",
              values: statusTarget,
            },
          ]
        : [];

    const allStatusDeviceSource =
      queryFiltersDevices.length > 0
        ? await getDevices({ filters: queryFiltersDevices })
        : [];

    const deviceUserTargets = allStatusDeviceSource.map(
      (device) => device.auth_id,
    );

    // console.log("deviceUserTargets", deviceUserTargets)

    const queryFiltersUsers =
      deviceUserTargets.length > 0
        ? [
            {
              method: "equal",
              attribute: "user_id",
              values: deviceUserTargets,
            },
          ]
        : [];

    const targetUsersFromStatusOptions =
      queryFiltersUsers.length > 0
        ? await getUser({ filters: queryFiltersUsers })
        : [];

    // console.log("targetUsersFromStatusOptions", targetUsersFromStatusOptions)

    const mergeTargets = [...selectedUsers, ...targetUsersFromStatusOptions];

    const removeDuplicated = mergeTargets.filter((value, index) => {
      const _value = JSON.stringify(value);
      return (
        index ===
        mergeTargets.findIndex((obj) => {
          return JSON.stringify(obj) === _value;
        })
      );
    });

    const removeAdmin = removeDuplicated.filter(
      (user) => user.type !== "Administrador",
    );

    const targets = removeAdmin.map((user) => {
      return { id: user.user_id, push_token: user.push_token };
    });

    // console.log("targets", targets)

    console.log(statusTarget);

    const selectedTargetsId = selectedUsers.map((user) => user.user_id);

    // const response = await sendPushNotification(values, targets)
    const response = await fetch("/api/send-push-notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pushToken: "ExponentPushToken[_VFcvcCCGvdKT4jQ3L3K45]",
        statusOptions: statusTarget,
        locationOptions: locationTarget,
        isAllUsersChecked: allUsers,
        selectedTargets: selectedTargetsId,
        targets: targets,
        title: values.title,
        message: values.description,
      }),
    });

    // console.log("response", response)

    response.ok
      ? toast.success("Notificação enviada com sucesso!")
      : toast.error("Erro ao enviar notificação");

    setRefresh(!refresh);

    form.reset();
    setStatusOptions({
      Regular: false,
      Roubado: false,
      Furtado: false,
      Perdido: false,
      Recuperado: false,
    });
    setLocationOptions({
      JoaoPessoa: false,
      Cabedelo: false,
      CampinaGrande: false,
      Bayeux: false,
      SantaRita: false,
    });

    setSelectedUsers([]);

    // const data = await response.json();
    // console.log(data);
  }

  function toggleAllStatusOptions() {
    if (
      statusOptions["Regular"] &&
      statusOptions["Roubado"] &&
      statusOptions["Furtado"] &&
      statusOptions["Perdido"] &&
      statusOptions["Recuperado"]
    ) {
      setStatusOptions({
        Regular: false,
        Roubado: false,
        Furtado: false,
        Perdido: false,
        Recuperado: false,
      });
      return;
    }

    setStatusOptions({
      Regular: true,
      Roubado: true,
      Furtado: true,
      Perdido: true,
      Recuperado: true,
    });
  }

  function toggleAllLocationsOptions() {
    if (
      locationOptions["JoaoPessoa"] &&
      locationOptions["Cabedelo"] &&
      locationOptions["CampinaGrande"] &&
      locationOptions["Bayeux"] &&
      locationOptions["SantaRita"]
    ) {
      setLocationOptions({
        JoaoPessoa: false,
        Cabedelo: false,
        CampinaGrande: false,
        Bayeux: false,
        SantaRita: false,
      });
      return;
    }

    setLocationOptions({
      JoaoPessoa: true,
      Cabedelo: true,
      CampinaGrande: true,
      Bayeux: true,
      SantaRita: true,
    });
  }

  useEffect(() => {
    if (selectedUsers.length > 0) {
      setAllUsers(false);
    }

    if (selectedUsers.length === 0) {
      setAllUsers(true);
    }
  }, [selectedUsers]);

  useEffect(() => {
    if (allUsers) {
      setSelectedUsers([]);
    }
  }, [allUsers]);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col items-center justify-between gap-4 self-center rounded-xl bg-white pb-4 text-zinc-900"
        >
          <div className="flex w-full justify-start rounded-t-xl bg-[#E6F1FD] px-4 py-2 font-medium">
            {true ? "Criar notificação" : "Editar notificação"}
          </div>

          <div className="flex w-full flex-col gap-4 px-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="flex w-fit items-center text-center">
                    <span className="flex h-6 align-text-bottom text-red-500">
                      *
                    </span>
                    Título
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      {...field}
                      className="ring-1 ring-zinc-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="flex w-fit items-center text-center">
                    <span className="flex h-6 align-text-bottom text-red-500">
                      *
                    </span>
                    Descrição
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} className="ring-1 ring-zinc-300" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex w-full justify-between rounded-lg bg-zinc-100 px-8 py-4">
              <div className="flex flex-col gap-2">
                <h3 className="font-medium">Usuários</h3>

                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={allUsers}
                    onClick={() => setAllUsers(!allUsers)}
                    className="bg-white shadow-sm drop-shadow-sm"
                  />
                  Todos os usuários
                </div>
                <span>Ou selecione usuários específicos</span>

                <AddUserToPushNotificationList
                  targets={selectedUsers}
                  setTargets={setSelectedUsers}
                />
                {/* <div className='flex flex-col'>
                  <div className='ring-1 ring-zinc-300 flex items-center gap-2 bg-white px-4 py-2 w-fit'>
                    <Search className='w-6 h-6' />
                    <input value={search} onChange={(e) => handleSearchChange(e.target.value)} placeholder='Pesquise por nome ou CPF' className='px-4 py-1 w-56 focus:outline-none' />
                  </div>
                  {predictions.length > 0 && (
                    <ul className="w-full h-20 flex flex-col bg-zinc-100 ring-1 ring-zinc-300 max-h-32 overflow-auto">
                      {predictions && predictions.map((user: User) => (
                        <li
                          key={user.$id}
                          className="px-4 py-2 cursor-pointer hover:bg-white ring-1 ring-zinc-300 italic"
                          onClick={() => handlePredictionSelect(user.push_token)}
                        >
                          {user.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div> */}
              </div>

              <Accordion
                className="flex flex-col gap-2"
                type="single"
                collapsible
              >
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <h3 className="font-medium">Status de dispositivo</h3>
                  </AccordionTrigger>
                  <AccordionContent className="flex items-center gap-2">
                    <>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          onClick={toggleAllStatusOptions}
                          className="bg-white shadow-sm drop-shadow-sm"
                        />
                        Todos
                      </div>

                      <div className="flex flex-col items-start gap-2 pl-4">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={statusOptions.Regular}
                            onClick={() =>
                              setStatusOptions({
                                ...statusOptions,
                                Regular: !statusOptions["Regular"],
                              })
                            }
                            className="bg-white shadow-sm drop-shadow-sm"
                          />
                          Regular
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={statusOptions.Roubado}
                            onClick={() =>
                              setStatusOptions({
                                ...statusOptions,
                                Roubado: !statusOptions["Roubado"],
                              })
                            }
                            className="bg-white shadow-sm drop-shadow-sm"
                          />
                          Roubado
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={statusOptions.Furtado}
                            onClick={() =>
                              setStatusOptions({
                                ...statusOptions,
                                Furtado: !statusOptions["Furtado"],
                              })
                            }
                            className="bg-white shadow-sm drop-shadow-sm"
                          />
                          Furtado
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={statusOptions.Perdido}
                            onClick={() =>
                              setStatusOptions({
                                ...statusOptions,
                                Perdido: !statusOptions["Perdido"],
                              })
                            }
                            className="bg-white shadow-sm drop-shadow-sm"
                          />
                          Perdido
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={statusOptions.Recuperado}
                            onClick={() =>
                              setStatusOptions({
                                ...statusOptions,
                                Recuperado: !statusOptions["Recuperado"],
                              })
                            }
                            className="bg-white shadow-sm drop-shadow-sm"
                          />
                          Recuperado
                        </div>
                      </div>
                    </>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* <div className="flex flex-col gap-2">
                <h3 className="font-medium">Status de dispositivo</h3>
                <div className="flex gap-2 items-center">
                  <Checkbox
                    onClick={toggleAllStatusOptions}
                    className="drop-shadow-sm shadow-sm bg-white"
                  />
                  Todos
                </div>

                <div className="flex gap-2 items-start flex-col pl-4">
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={statusOptions.Regular}
                      onClick={() =>
                        setStatusOptions({
                          ...statusOptions,
                          Regular: !statusOptions["Regular"],
                        })
                      }
                      className="drop-shadow-sm shadow-sm bg-white"
                    />
                    Regular
                  </div>
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={statusOptions.Roubado}
                      onClick={() =>
                        setStatusOptions({
                          ...statusOptions,
                          Roubado: !statusOptions["Roubado"],
                        })
                      }
                      className="drop-shadow-sm shadow-sm bg-white"
                    />
                    Roubado
                  </div>
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={statusOptions.Furtado}
                      onClick={() =>
                        setStatusOptions({
                          ...statusOptions,
                          Furtado: !statusOptions["Furtado"],
                        })
                      }
                      className="drop-shadow-sm shadow-sm bg-white"
                    />
                    Furtado
                  </div>
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={statusOptions.Perdido}
                      onClick={() =>
                        setStatusOptions({
                          ...statusOptions,
                          Perdido: !statusOptions["Perdido"],
                        })
                      }
                      className="drop-shadow-sm shadow-sm bg-white"
                    />
                    Perdido
                  </div>
                  <div className="flex gap-2 items-center">
                    <Checkbox
                      checked={statusOptions.Recuperado}
                      onClick={() =>
                        setStatusOptions({
                          ...statusOptions,
                          Recuperado: !statusOptions["Recuperado"],
                        })
                      }
                      className="drop-shadow-sm shadow-sm bg-white"
                    />
                    Recuperado
                  </div>
                </div>
              </div> */}

              <div className="flex flex-col gap-2">
                <h3 className="font-medium">Localidade ou região</h3>
                <div className="flex items-center gap-2 text-zinc-500">
                  <Checkbox
                    disabled
                    onClick={toggleAllLocationsOptions}
                    className="bg-white shadow-sm drop-shadow-sm"
                  />
                  Todos
                </div>

                <div className="flex flex-col items-start gap-2 pl-4">
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Checkbox
                      disabled
                      checked={locationOptions.JoaoPessoa}
                      onClick={() =>
                        setLocationOptions({
                          ...locationOptions,
                          JoaoPessoa: !locationOptions["JoaoPessoa"],
                        })
                      }
                      className="bg-white shadow-sm drop-shadow-sm"
                    />
                    João Pessoa
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Checkbox
                      disabled
                      checked={locationOptions.Cabedelo}
                      onClick={() =>
                        setLocationOptions({
                          ...locationOptions,
                          Cabedelo: !locationOptions["Cabedelo"],
                        })
                      }
                      className="bg-white shadow-sm drop-shadow-sm"
                    />
                    Cabedelo
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Checkbox
                      disabled
                      checked={locationOptions.CampinaGrande}
                      onClick={() =>
                        setLocationOptions({
                          ...locationOptions,
                          CampinaGrande: !locationOptions["CampinaGrande"],
                        })
                      }
                      className="bg-white shadow-sm drop-shadow-sm"
                    />
                    Campina Grande
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Checkbox
                      disabled
                      checked={locationOptions.Bayeux}
                      onClick={() =>
                        setLocationOptions({
                          ...locationOptions,
                          Bayeux: !locationOptions["Bayeux"],
                        })
                      }
                      className="bg-white shadow-sm drop-shadow-sm"
                    />
                    Bayeux
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <Checkbox
                      disabled
                      checked={locationOptions.SantaRita}
                      onClick={() =>
                        setLocationOptions({
                          ...locationOptions,
                          SantaRita: !locationOptions["SantaRita"],
                        })
                      }
                      className="bg-white shadow-sm drop-shadow-sm"
                    />
                    Santa Rita
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full justify-between">
              <Button variant="white" type="button" className="xl:text-base">
                Cancelar
              </Button>
              <ConfirmationDialog
                onConfirm={() => form.handleSubmit(onSubmit)}
                title="Enviar notificação?"
                description="Tem certeza que deseja enviar a notificação?"
              >
                <Button variant="blue" type="submit" className="xl:text-base">
                  Enviar notificação
                </Button>
              </ConfirmationDialog>

              {/* <Dialog>
                <DialogTrigger>
                  <Button
                    variant="blue"
                    type="button"
                    className="xl:text-base"
                  >
                    Enviar notificação
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove your data from our servers.
                    </DialogDescription>

                     <Button
                      variant="blue"
                      type="button"
                      className="xl:text-base"
                      onClick={() => form.handleSubmit(onSubmit)}
                    >
                      Enviar notificação
                    </Button>
                  </DialogHeader>
                </DialogContent>
              </Dialog> */}

              {/* <AlertDialog>
                <AlertDialogTrigger>teste</AlertDialogTrigger>
                <AlertDialogContent className="w-[90%] mr-10">
                  <AlertDialogHeader>
                    <AlertDialogTitle>teste</AlertDialogTitle>
                    <AlertDialogDescription>ts</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex flex-row items-center justify-between w-full gap-4">
                    <AlertDialogCancel className="rounded-full text-center items-center justify-center flex flex-1 w-full px-2 py-2 transition-all duration-300 bg-white border-[0.5px] border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      // className="rounded-full text-center items-center self-end justify-center flex flex-1 w-full px-2 py-2 transition-all duration-300 bg-secondary border-[0.5px] border-secondary text-white hover:bg-white hover:text-secondary"
                      asChild
                    >
                      <Button
                        variant="blue"
                        type="submit"
                        className="xl:text-base"
                      >
                        Enviar notificação
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog> */}
            </div>
          </div>
        </form>
      </Form>

      <div className="flex h-full w-full flex-col gap-2 rounded-xl bg-white">
        <div className="w-full rounded-t-xl bg-[#E6F1FD] px-4 py-2 font-medium">
          Historico de notificações
        </div>

        <NotificationTable
          form={form}
          refresh={refresh}
          restoreNotification={restoreFilterFromHistory}
        />
      </div>
    </>
  );
}

export default NotificationForm;
