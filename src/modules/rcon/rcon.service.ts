import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Rcon } from 'rcon-client';

@Injectable()
export class RconService {
  constructor(private readonly configService: ConfigService) {}

  private rconClassic: Rcon;

  async connect() {
    try {
      this.rconClassic = new Rcon({
        host: this.configService.get('BUNGEE_HOST') || '',
        port: this.configService.get('BUNGEE_PORT'),
        password: this.configService.get('BUNGEE_PASSWORD') || '',
      });

      await this.rconClassic.connect();
      console.log('Connected to RCON');
    } catch (error) {
      console.error('Failed to connect to RCON:', error);
    }
  }

  async disconnect() {
    try {
      await this.rconClassic.end();
      console.log('Disconnected from RCON');
    } catch (error) {
      console.error('Failed to disconnect from RCON:', error);
    }
  }

  async sendCommandClassic(command: string) {
    try {
      const response = await this.rconClassic.send(command);
      console.log('Command response:', response);
    } catch (error) {
      console.error('Failed to send command:', error);
    }
  }
}
