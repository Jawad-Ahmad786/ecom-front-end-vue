<template>
  <div>
    <BForm id="payment-form" @submit.prevent="handlePaymentSubmit()">
        <div id="card-element"></div>
      <BButton type="submit" :disabled="processingPayment">
        <span v-if="processingPayment">Processing...</span>
        <span v-else>Pay Now</span>
      </BButton>
      <BAlert v-if="paymentError" variant="danger">
        {{ paymentError }}
      </BAlert>
    </BForm>
  </div>
</template>

<script>
import { loadStripe } from '@stripe/stripe-js';
import { BButton, BForm, BAlert } from 'bootstrap-vue-next'

export default {
  props: {
    stripePublicKey: String,
    orderId: Number,
  },
 components: {
    BButton,
    BForm,
    BAlert
 },
  data() {
    return {
      stripe: null,
      paymentIntentClientSecret: null,
      cardElement: null,
      cardExpirationDateElement: null,
      cardCvcElement: null,
      processingPayment: false,
      paymentError: null,
    };
  },

  methods: {
    async fetchPaymentIntentClientSecret() {
        this.$axios.post('create-payment-intent', {
          items: [{ id: this.orderId }]
        })
          .then(response => {
            this.paymentIntentClientSecret = response.data.clientSecret;
          })
       .catch (error => {
        console.error(error);
        this.paymentError = 'Error fetching payment intent client secret';
      })
    },

    async createCardElements() {
      if (!this.stripe) {
        return; // Stripe not yet loaded
      }

      const elements = this.stripe.elements();

      const cardElementOptions = {
        style: {
          base: {
            fontSize: '16px',
            color: '#32325d',
          },
        },
      };

      this.cardElement = elements.create('card', cardElementOptions);
      this.cardElement.mount('#card-element');
    },

    async handlePaymentSubmit() {
      this.processingPayment = true;
      this.paymentError = null; // Clear previous errors

      if (!this.stripe || !this.cardElement || !this.paymentIntentClientSecret) {
        console.error('Missing required data for payment processing');
        this.processingPayment = false;
        return;
      }

      try {
        const { error } = await this.stripe.confirmCardPayment(
          this.paymentIntentClientSecret,
          {
            payment_method: {
              card: this.cardElement,
            },
          },
        );

        if (error) {
          this.paymentError = error.message;
        } else {
          this.handlePaymentSuccess(this.orderId);
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.processingPayment = false;
      }
    },

    handlePaymentSuccess(orderId) {
      this.$axios.get(`payment-complete?order_id=${orderId}`)
        .then(response => {
          alert(response.data.message);
          this.$router.push({ name: 'Home' });
        })
        .catch(error => {
          console.log(error)
        })
    },
  },

  mounted() {
    loadStripe(this.stripePublicKey)
      .then((stripe) => {
        this.stripe = stripe;
        this.fetchPaymentIntentClientSecret();
        this.createCardElements();
      })
      .catch((error) => console.error(error));
  },
};
</script>