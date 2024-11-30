<template>
  <b-table :items="products" :fields="fields" bordered striped>
    <template #cell(category_id)="data">
      <b class="text-info">
        {{ data.item.category.name }}
      </b>
    </template>
    <template #cell(brand_id)="data">
      <b class="text-info">
        {{ data.item.brand.name }}
      </b>
    </template>
    <template #cell(discount)="data">
      <p>
        {{ data.item.discount ?? 0 }}
      </p>
    </template>
    <template #cell(description)="data">
      <p>
        {{ data.item.description ? data.item.description : 'N/A' }}
      </p>
    </template>
    <template #cell(short_description)="data">
      <p>
        {{ data.item.short_description ? data.item.short_description : 'N/A' }}
      </p>
    </template>
    <template #cell(status)>
      <b class="text-success">Active</b>
    </template>
    <template #cell(featured)="data">
      <b :class="data.item.featured === 1 ? 'text-success' : 'text-danger'">
        {{ data.item.featured === 1 ? 'Featured' : 'Not Featured' }}
      </b>
    </template>
  </b-table>
</template>

<script>
import { BTable } from 'bootstrap-vue-next';

export default {
  components: {
    BTable, // Register the BTable component
  },
  data() {
    return {
      products: [],
      fields: [
           'name',
           'sku',
           'slug',
           { key: 'category_id', label: 'Category' },
           { key: 'brand_id', label: 'Brand' },
           { key:'description', label: 'Desc' },
           { key: 'short_description', label: 'short_desc'},
            'stock',
            'price',
            'status',
            'featured',
            'discount',
      ]
    }
  },
  methods: {
    async getProducts() {
      await this.$axios
        .get('products')
        .then((response) => {
          console.log(response.data.products)
          this.products = response.data.products
        })
        .catch((error) => {
          console.log(error)
        })
    }
  },
  mounted() {
     this.getProducts();
  }
}
</script>
