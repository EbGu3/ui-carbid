
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#f6f7f8',100:'#eceeef',200:'#d7dbdf',300:'#b5bbc1',400:'#8e959d',500:'#6e757d',600:'#555b61',700:'#43464b',800:'#393c40',900:'#2e3135' },
        accent:'#e5e5e5'
      },
      boxShadow: { soft:'0 6px 30px rgba(0,0,0,.08)' },
      dropShadow: { logo:'2px 4px 0 rgba(0,0,0,.35)' },
      borderRadius: { '3xl': '1.75rem' }
    },
    fontFamily: { sans:['Inter','system-ui','Avenir','Helvetica','Arial','ui-sans-serif'] }
  },
  plugins: [],
}
