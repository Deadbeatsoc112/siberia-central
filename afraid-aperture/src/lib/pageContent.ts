import { db } from './db';

export type PageContentInput = {
	pageKey: string;
	section: string;
	contentType: string;
	contentValue: string;
	label: string;
	description?: string;
	displayOrder?: number;
};

const nowEpoch = () => Math.floor(Date.now() / 1000);

export const pageContentRepo = {
	listAll: () =>
		db.prepare('SELECT * FROM page_content ORDER BY section, display_order').all() as Array<{
			id: number;
			page_key: string;
			section: string;
			content_type: string;
			content_value: string;
			label: string;
			description: string | null;
			display_order: number;
			updated_at: number;
		}>,

	listBySection: (section: string) =>
		db.prepare('SELECT * FROM page_content WHERE section = ? ORDER BY display_order').all(section) as Array<{
			id: number;
			page_key: string;
			section: string;
			content_type: string;
			content_value: string;
			label: string;
			description: string | null;
			display_order: number;
			updated_at: number;
		}>,

	getByKey: (pageKey: string) =>
		db.prepare('SELECT * FROM page_content WHERE page_key = ?').get(pageKey) as
			| {
					id: number;
					page_key: string;
					section: string;
					content_type: string;
					content_value: string;
					label: string;
					description: string | null;
					display_order: number;
					updated_at: number;
			  }
			| undefined,

	update: (pageKey: string, contentValue: string) => {
		const ts = nowEpoch();
		db.prepare('UPDATE page_content SET content_value = ?, updated_at = ? WHERE page_key = ?').run(
			contentValue,
			ts,
			pageKey,
		);
	},
};
