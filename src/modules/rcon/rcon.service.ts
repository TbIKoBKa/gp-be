import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Rcon } from 'rcon-client';

@Injectable()
export class RconService {
  constructor(private readonly configService: ConfigService) {}

  private rcon: Rcon;

  async connect() {
    try {
      this.rcon = new Rcon({
        host: this.configService.get('RCON_HOST') || '',
        port: this.configService.get('RCON_PORT'),
        password: this.configService.get('RCON_PASSWORD') || '',
      });

      await this.rcon.connect();
      console.log('Connected to RCON');
    } catch (error) {
      console.error('Failed to connect to RCON:', error);
    }
  }

  async disconnect() {
    try {
      await this.rcon.end();
      console.log('Disconnected from RCON');
    } catch (error) {
      console.error('Failed to disconnect from RCON:', error);
    }
  }

  async sendCommand(command: string) {
    try {
      const response = await this.rcon.send(command);
      console.log('Command response:', response);
    } catch (error) {
      console.error('Failed to send command:', error);
    }
  }
}
