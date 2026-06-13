  import { getProductList } from '/web/utils/load_view.js'
  // 获取产品列表
const renderProducts = async ()=>{
  const res = await getProductList();
  if (res) {
    const productList = res.slice(0, 5)
    // console.log(productList)
    const productHtml = `
      <ul class="space-y-3">
        ${productList.map(item=>{
          return `
            <li>
            <a href="${item.link}" class="text-gray-400 hover:text-white transition-colors duration-300">${item.title}</a>
          </li>
          `
        }).join('\n')}
        </ul>
    `
    $('#footer-menu-product').html(productHtml)
  }
}
renderProducts();