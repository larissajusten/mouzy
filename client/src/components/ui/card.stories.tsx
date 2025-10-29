import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content with some information.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithoutFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Notification</CardTitle>
        <CardDescription>You have 3 unread messages</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Your messages are waiting for you.</p>
      </CardContent>
    </Card>
  ),
};

export const GameRoomCard: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle className="text-2xl">Sala de Jogo</CardTitle>
        <CardDescription>Código: ABC123</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium mb-2">Jogadores (3/8)</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Jogador 1</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>Jogador 2</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Jogador 3</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Iniciar Jogo</Button>
      </CardFooter>
    </Card>
  ),
};
