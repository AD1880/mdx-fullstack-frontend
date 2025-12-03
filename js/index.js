
// Vue.js Application
let app = new Vue({
  el: '#app',
  
  data: {
      apiUrl: 'https://mdx-fullstack-backend.onrender.com', 
      
      allLessons: [],        
      displayedLessons: [],  
      
     
      loading: true,
      error: null, 

      searchQuery: '',
      sortBy: 'subject',
      sortOrder: 'asc',
      
      
      cartItems: [],
      
      showCheckout: false,  
      customerInfo: {       
          name: '',
          phone: ''
      },
      submittingOrder: false,
      orderSuccess: null,
      orderError: null,
  },
  
  
  computed: {
      
      cartTotal() {
          return this.cartItems.reduce((total, item) => total + item.price, 0);
      }
  },
  
  
  methods: {
      
    
    async fetchLessons() {
      try {
        console.log('📚 Fetching lessons from API...');
        
        this.loading = true;
        this.error = null;
        
        // Make API call to get lessons
        const response = await fetch(`${this.apiUrl}/lessons`);
        
        // Check if request was successful
        if (!response.ok) {
            throw new Error(`Failed to fetch lessons: ${response.status}`);
        }
          
        // Parse JSON response
        const lessons = await response.json();
          
        console.log(`✅ Loaded ${lessons.length} lessons`);
          
        // Update our data
        this.allLessons = lessons;
        this.displayedLessons = [...lessons]; // Copy the array
          
        // Apply current sorting
        this.sortLessons();
          
      } catch (error) {
        console.error('❌ Error fetching lessons:', error);
        this.error = 'Failed to load lessons. Please try again later.';
      } finally {
        this.loading = false;
      }
    },
      
   
    async searchLessons() {
      try {
        console.log('🔍 Searching lessons:', this.searchQuery);
          
        // If search is empty, show all lessons
        if (!this.searchQuery.trim()) {
            this.displayedLessons = [...this.allLessons];
            this.sortLessons();
            return;
        }
            
        // Make API call to search lessons
        const response = await fetch(`${this.apiUrl}/search?query=${encodeURIComponent(this.searchQuery)}`);
            
        if (!response.ok) {
            throw new Error(`Search failed: ${response.status}`);
        }
            
        const searchResults = await response.json();
            
        console.log(`✅ Found ${searchResults.length} results`);
            
        // Update displayed lessons
        this.displayedLessons = searchResults;
            
        // Apply current sorting
        this.sortLessons();
            
        } catch (error) {
          console.error('❌ Search error:', error);
          this.error = 'Search failed. Please try again.';
        }
    },
      
    
    sortLessons() {
        console.log(`📊 Sorting by ${this.sortBy} (${this.sortOrder})`);
        
        this.displayedLessons.sort((a, b) => {
            let valueA = a[this.sortBy];
            let valueB = b[this.sortBy];
            
            // Handle string comparisons (case insensitive)
            if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }
            
            // Compare values
            let comparison = 0;
            if (valueA < valueB) {
                comparison = -1;
            } else if (valueA > valueB) {
                comparison = 1;
            }
            
            // Apply sort order
            return this.sortOrder === 'desc' ? comparison * -1 : comparison;
        });
    },
      
   
    addToCart(lesson) {
        console.log('🛒 Adding to cart:', lesson.subject);
        
        // Check if lesson is already in cart
        const existingItem = this.cartItems.find(item => item._id === lesson._id);
        
        if (existingItem) {
            alert('This lesson is already in your cart!');
            return;
        }
        
        // Add lesson to cart
        this.cartItems.push({
            _id: lesson._id,
            subject: lesson.subject,
            location: lesson.location,
            price: lesson.price,
            quantity: 1
        });
        
        console.log(`✅ Cart now has ${this.cartItems.length} items`);
    },
      
    async submitOrder() {
        try {
            console.log('📝 Submitting order...');
            
            this.submittingOrder = true;
            this.orderError = null;
            
            // Prepare order data
            const orderData = {
                name: this.customerInfo.name,
                phone: this.customerInfo.phone,
                lessons: this.cartItems.map(item => ({
                    id: item._id,
                    subject: item.subject,
                    location: item.location,
                    price: item.price,
                    quantity: item.quantity
                })),
                totalAmount: this.cartTotal
            };
            
            // Make API call to create order
            const response = await fetch(`${this.apiUrl}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to place order');
            }
            
            const result = await response.json();
            
            console.log('✅ Order placed successfully:', result);
            
            // Show success message
            this.orderSuccess = result.orderNumber || result.orderId;
            
            // Clear cart and form
            this.cartItems = [];
            this.customerInfo = { name: '', phone: '' };
            
            // Refresh lessons to update available spaces
            await this.fetchLessons();
            
        } catch (error) {
            console.error('❌ Order error:', error);
            this.orderError = error.message || 'Failed to place order. Please try again.';
        } finally {
            this.submittingOrder = false;
        }
    },
      
    
    closeModal() {
        this.showCheckout = false;
        this.orderSuccess = null;
        this.orderError = null;
        
        // If order was successful, reset form
        if (this.orderSuccess) {
            this.customerInfo = { name: '', phone: '' };
        }
    },
      
   
    getLessonIcon(subject) {
        const iconMap = {
            'Math': 'fas fa-calculator',
            'English': 'fas fa-book',
            'Science': 'fas fa-flask',
            'History': 'fas fa-landmark',
            'Art': 'fas fa-palette',
            'Music': 'fas fa-music',
            'Sports': 'fas fa-futbol',
            'Drama': 'fas fa-theater-masks',
            'Computing': 'fas fa-laptop-code',
            'French': 'fas fa-language'
        };
        
        return iconMap[subject] || 'fas fa-graduation-cap';
    },
    
    
    getSpacesClass(spaces) {
        if (spaces === 0) return 'spaces-available';
        if (spaces <= 5) return 'spaces-available low';
        return 'spaces-available available';
    }
  },

  async mounted() {
    console.log(' Vue app mounted, loading lessons...');
    
    
    await this.fetchLessons();
  }
});

