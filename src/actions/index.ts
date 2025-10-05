import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import { spotify } from '@/actions/spotify.ts';

export const server = {
	spotify
}