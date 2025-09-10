

# Product Dashboard

This project is a simple Product Dashboard web application built with React and Vite. It allows users to view, add, update, and manage products in a user-friendly interface.

## Live Demo
Check out the live dashboard here: [https://spark-and-gen.vercel.app/](https://spark-and-gen.vercel.app/)

## Features
- View a list of products
- Add new products
- Update existing products
- View product details in a modal
- Pagination for product list
- Theme toggle (light/dark mode)
- User context management

## Technologies Used
- React
- Vite
- Tailwind CSS
- PostCSS
- ESLint

## Folder Structure
```
src/
	App.jsx            # Main application component
	components/        # Reusable UI components
		AddProduct.jsx
		Dashboard.jsx
		Header.jsx
		Pagination.jsx
		ProductDetails.jsx
		ProductDetailsModal.jsx
		ProductList.jsx
		ThemeToggle.jsx
		UpdateProductModal.jsx
	context/
		UserContext.jsx  # User context provider
	assets/            # Static assets
```

## Getting Started

### Prerequisites
- Node.js (v16 or above recommended)
- npm or yarn

### Installation
1. Clone the repository:
	 ```sh
	 git clone https://github.com/NeerajGupta4820/spark_and_gen.git
	 cd spark_and_gen
	 ```
2. Install dependencies:
	 ```sh
	 npm install
	 # or
	 yarn install
	 ```
3. Start the development server:
	 ```sh
	 npm run dev
	 # or
	 yarn dev
	 ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser to view the dashboard.

## Usage
- Use the dashboard to add, update, and view products.
- Switch between light and dark themes using the toggle.
- Pagination helps navigate through large product lists.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.
