import { z } from "zod";
export const HardwareDeviceBaseSchema = z.object({
  code_device: z.string().min(1),
  serial_number: z.string().min(1),
});

export type HardwareDevice = z.infer<typeof HardwareDeviceBaseSchema> & {
  id: number;
};
