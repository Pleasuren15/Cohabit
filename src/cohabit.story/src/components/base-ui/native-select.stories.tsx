import type { Meta, StoryObj } from "@storybook/react"

import { NativeSelect } from "./native-select"
import { Label } from "@/components/ui/label"

const meta = {
  title: "base-ui/NativeSelect",
  component: NativeSelect,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof NativeSelect>

export default meta
type Story = StoryObj<typeof meta>

export const Basic: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <NativeSelect defaultValue="bc" className="rounded-md border border-input">
        <option value="ab">Alberta</option>
        <option value="bc">British Columbia</option>
        <option value="on">Ontario</option>
        <option value="qc">Quebec</option>
      </NativeSelect>
    </div>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="province-native">Province</Label>
      <NativeSelect
        id="province-native"
        defaultValue="bc"
        className="rounded-md border border-input"
      >
        <option value="ab">Alberta</option>
        <option value="bc">British Columbia</option>
        <option value="on">Ontario</option>
        <option value="qc">Quebec</option>
      </NativeSelect>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <NativeSelect
        disabled
        defaultValue="bc"
        className="rounded-md border border-input"
      >
        <option value="ab">Alberta</option>
        <option value="bc">British Columbia</option>
        <option value="on">Ontario</option>
      </NativeSelect>
    </div>
  ),
}

export const Sized: Story = {
  render: () => (
    <NativeSelect defaultValue="bc" className="w-64 rounded-md border border-input">
      <option value="ab">Alberta</option>
      <option value="bc">British Columbia</option>
      <option value="on">Ontario</option>
      <option value="qc">Quebec</option>
    </NativeSelect>
  ),
}

export const ManyOptions: Story = {
  render: () => (
    <div className="w-full max-w-sm">
      <NativeSelect defaultValue="toronto" className="rounded-md border border-input">
        <option value="toronto">Toronto</option>
        <option value="vancouver">Vancouver</option>
        <option value="montreal">Montreal</option>
        <option value="calgary">Calgary</option>
        <option value="ottawa">Ottawa</option>
        <option value="edmonton">Edmonton</option>
        <option value="winnipeg">Winnipeg</option>
        <option value="victoria">Victoria</option>
        <option value="halifax">Halifax</option>
        <option value="quebec-city">Quebec City</option>
      </NativeSelect>
    </div>
  ),
}
