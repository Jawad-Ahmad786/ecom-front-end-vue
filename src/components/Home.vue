<template>
  <div>
    <BRow>
      <BCol md="6" v-for="product in products" :key="product.id">
        <BCard no-body class="overflow-hidden" style="max-width: 540px">
          <BRow class="g-0">
            <BCol md="6">
              <BCardImg :src="getProductImage(product)" alt="Image" class="rounded-0" />
            </BCol>
            <BCol md="6">
              <BCardBody>
                <h5>{{ product.name }}</h5>
                <p><strong>Price:</strong> ${{ product.price }}</p>
                <BCardText>
                  {{ product.description }}
                </BCardText>
              <BButton :disabled="product.stock === 0" @click="addToCart(product)" size="sm" variant="primary">
                {{ product.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
              </BButton>
              </BCardBody>
            </BCol>
          </BRow>
        </BCard>
      </BCol>
    </BRow>
  </div>
</template>

<script>
import { BCard, BCardText, BButton, BCardImg, BCardBody, BRow, BCol } from 'bootstrap-vue-next';

export default {
  components: {
    BCard,
    BCardText,
    BButton,
    BCardImg,
    BCardBody,
    BRow,
    BCol,
  },
  data() {
    return {
      products: [],
      cart_products: [],
      cart_product_quantity: [],
    };
  },
  methods: {
    async getProducts() {
      try {
        // this.$axios.get('http://backend.ecom.com:8000/sanctum/csrf-cookie').then( async () => {
          const response = await this.$axios.get('products');
          this.products = response.data.products;
        // });

      } catch (error) {
        console.log(error);
      }
    },
    getProductImage(product) {
      if (product.images && product.images.length > 0) {
        return this.getImageUrl(product.images[0].image);
      }
      // Fallback to a placeholder image if no images are available
      return 'https://picsum.photos/400/400/?image=20';
    },
    getImageUrl(imagePath) {
      // Use the axios base URL directly
      return `${this.$axios.defaults.baseURL.replace('/api/', '')}/storage/${imagePath}`;
    },
    async addToCart(product){
      this.cart_products.push(product.id);
      this.cart_product_quantity.push(1);
      let data = {
        'product_ids': this.cart_products,
        'quantity': this.cart_product_quantity,
      }
      await this.$axios.post('cart/add-to-cart', data)
        .then(response => {
          alert(response.data.message);
          this.cart_products = [];
          this.cart_product_quantity = [];
          this.$router.push({name: 'Cart'});
        })
        .catch(error => {
          console.log(error.message);
          this.cart_products = [];
          this.cart_product_quantity = [];
        })
    },
   },
  mounted() {
    this.getProducts();
  },
};
</script>
