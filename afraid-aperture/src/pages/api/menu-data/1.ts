import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
	// Datos hardcodeados del menú Central
	const menuData = {
		id: 1,
		name: 'Menu Central',
		categories: [
			{
				id: 1,
				name: 'TOSTADAS',
				items: [
					{ id: 1, name: 'TOSTADA DE PECHUGA', description: 'HEN BREAST TOSTADA', price: 93.00, is_available: 1 },
					{ id: 2, name: 'TOSTADA DE PECHUGA JUNIOR', description: 'JUNIOR HEN BREAST TOSTADA', price: 64.00, is_available: 1 },
					{ id: 3, name: 'TOSTADA DE PIERNA', description: 'HEN LEG TOSTADA', price: 76.00, is_available: 1 },
					{ id: 4, name: 'TOSTADA DE PIERNA JUNIOR', description: 'JUNIOR HEN LEG TOSTADA', price: 51.00, is_available: 1 },
					{ id: 5, name: 'TOSTADA DEL ABUELO', description: "GRANDPA'S TOSTADA", price: 84.00, is_available: 1 },
				]
			},
			{
				id: 2,
				name: 'TACOS',
				items: [
					{ id: 6, name: 'TACOS DE PECHUGA', description: 'HEN BREAST TOSTADA', price: 93.00, is_available: 1 },
					{ id: 7, name: 'TACO DE PECHUGA JUNIOR', description: 'JUNIOR HEN BREAST TOSTADA', price: 64.00, is_available: 1 },
					{ id: 8, name: 'TACO DE PIERNA', description: 'HEN LEG TOSTADA', price: 76.00, is_available: 1 },
					{ id: 9, name: 'TACO DE PIERNA JUNIOR', description: 'JUNIOR HEN LEG TOSTADA', price: 51.00, is_available: 1 },
				]
			},
			{
				id: 3,
				name: 'CALDOS',
				items: [
					{ id: 10, name: 'TLALPENO', description: 'Arroz servido en consome de gallina, con pechuga deshebrada, queso asadero en cubos, tiritas fritas en manteca, un toque de chipotle y aguacate fresco.', price: 104.00, is_available: 1 },
					{ id: 11, name: 'CALDO DE PECHUGA', description: 'Consome de gallina con arroz, pechuga y una tortilla para acompanar.', price: 93.00, is_available: 1 },
					{ id: 12, name: 'CALDO DE PIERNA', description: 'Consome de gallina con arroz, una pieza de pierna y una tortilla para acompanar.', price: 76.00, is_available: 1 },
				]
			},
			{
				id: 4,
				name: 'CONSOME',
				items: [
					{ id: 13, name: 'CONSOME', description: 'Consome de gallina con arroz.', price: 39.00, is_available: 1 },
					{ id: 14, name: 'CONSOME DE PECHUGA', description: 'Consome de gallina grande con pechuga y arroz.', price: 93.00, is_available: 1 },
					{ id: 15, name: 'CONSOME DE PIERNA', description: 'Consome de gallina con pierna, arroz, y una tortilla para acompanar.', price: 93.00, is_available: 1 },
				]
			},
			{
				id: 5,
				name: 'COMBOS',
				items: [
					{ id: 16, name: 'COMBO 1', description: 'Tostada grande de pechuga/pierna + consome + refresco.', price: 0, is_available: 1 },
				]
			},
			{
				id: 6,
				name: 'BEBIDAS',
				items: [
					{ id: 17, name: 'COCA-COLA', description: 'Regular / Light / Sin azucar', price: 34.00, is_available: 1 },
					{ id: 18, name: 'FUZE TEA', description: 'Regular / Light / Sin azucar', price: 37.00, is_available: 1 },
					{ id: 19, name: 'AGUA', description: 'Natural / Mineral', price: 29.00, is_available: 1 },
				]
			},
			{
				id: 7,
				name: 'EXTRAS',
				items: [
					{ id: 20, name: 'CHILES', description: 'Jalapeno Peppers', price: 5.00, is_available: 1 },
					{ id: 21, name: 'CREMA', description: 'Sour cream', price: 17.00, is_available: 1 },
					{ id: 22, name: 'TAPA GRANDE', description: 'Large tortilla tostado', price: 15.00, is_available: 1 },
					{ id: 23, name: 'TAPA CHICA', description: 'Small tortilla tostado', price: 8.00, is_available: 1 },
					{ id: 24, name: 'GUACAMOLE', description: 'Guacamole', price: 44.00, is_available: 1 },
					{ id: 25, name: 'ORDEN PECHUGA', description: 'Portion of Hen breast', price: 54.00, is_available: 1 },
				]
			}
		]
	};

	return new Response(JSON.stringify(menuData), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});
};
