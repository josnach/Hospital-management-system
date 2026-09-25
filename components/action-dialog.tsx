"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { FaQuestion } from "react-icons/fa6";
import { toast } from "sonner";

import { deleteDataById } from "@/app/actions/general";
import { ProfileImage } from "./profile-image";
import { SmallCard } from "./small-card";

interface ActionDialogProps {
  type: "doctor" | "staff" | "delete";
  id: string;
  data?: any;
  deleteType?:
    | "doctor"
    | "staff"
    | "patient"
    | "payment"
    | "bill"
    | "lab_test";
}

export const ActionDialog = ({
  id,
  data,
  type,
  deleteType,
}: ActionDialogProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  /*
   * DELETE DIALOG
   */
  if (type === "delete") {
    const handleDelete = async () => {
      if (!deleteType) {
        toast.error("Delete type is missing");
        return;
      }

      try {
        setLoading(true);

        const res = await deleteDataById(id, deleteType);

        if (res?.success) {
          toast.success("Record deleted successfully");
          router.refresh();
        } else {
          toast.error(res?.message || "Failed to delete record");
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Something went wrong while deleting the record");
      } finally {
        setLoading(false);
      }
    };

    return (
      <Dialog>
        <DialogTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="flex items-center justify-center rounded-full text-red-500"
            >
              <Trash2 size={16} className="text-red-500" />

              {deleteType === "patient" && "Delete"}
            </Button>
          }
        />

        <DialogContent>
          <div className="flex flex-col items-center justify-center py-6">
            <DialogTitle>
              <div className="bg-red-200 p-4 rounded-full mb-2">
                <FaQuestion size={50} className="text-red-500" />
              </div>
            </DialogTitle>

            <span className="text-xl text-black">
              Delete Confirmation
            </span>

            <p className="text-sm text-gray-600 text-center mt-1">
              Are you sure you want to delete the selected record?
            </p>

            <div className="flex justify-center mt-6 items-center gap-x-3">
              <DialogClose
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="px-4 py-2"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                }
              />

              <Button
                type="button"
                disabled={loading}
                variant="outline"
                className="px-4 py-2 text-sm font-medium bg-destructive text-white hover:bg-destructive hover:text-white"
                onClick={handleDelete}
              >
                {loading ? "Deleting..." : "Yes. Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  /*
   * STAFF INFORMATION DIALOG
   */
  if (type === "staff") {
    return (
      <Dialog>
        <DialogTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="flex items-center justify-center rounded-full text-blue-600 hover:underline"
            >
              View
            </Button>
          }
        />

        <DialogContent className="max-w-[300px] md:max-w-2xl max-h-[90%] p-8 overflow-y-auto">
          <DialogTitle className="text-lg text-gray-600 font-semibold mb-4">
            Staff Information
          </DialogTitle>

          <div className="flex justify-between">
            <div className="flex gap-3 items-center">
              <ProfileImage
                url={data?.img}
                name={data?.name}
                className="xl:size-20"
                bgColor={data?.colorCode}
                textClassName="xl:text-2xl"
              />

              <div className="flex flex-col">
                <p className="text-xl font-semibold">
                  {data?.name || "N/A"}
                </p>

                <span className="text-gray-600 text-sm md:text-base capitalize">
                  {data?.role?.toLowerCase() || "N/A"}
                </span>

                <span className="text-blue-500 text-sm">
                  Full-Time
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-6">
            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-y-4 md:gap-x-0 xl:justify-between">
              <SmallCard
                label="Email Address"
                value={data?.email || "N/A"}
              />

              <SmallCard
                label="Phone Number"
                value={data?.phone || "N/A"}
              />
            </div>

            <div>
              <SmallCard
                label="Address"
                value={data?.address || "N/A"}
              />
            </div>

            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-y-4 md:gap-x-0 xl:justify-between">
              <SmallCard
                label="Role"
                value={data?.role || "N/A"}
              />

              <SmallCard
                label="Department"
                value={data?.department || "N/A"}
              />

              <SmallCard
                label="License Number"
                value={data?.license_number || "N/A"}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  /*
   * No dialog
   */
  return null;
};