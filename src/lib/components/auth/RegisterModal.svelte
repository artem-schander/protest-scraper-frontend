<script>
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/common/Modal.svelte';
	import Input from '$lib/components/common/Input.svelte';
	import Button from '$lib/components/common/Button.svelte';
	import Icon from '@iconify/svelte';
	import { authStore } from '$lib/stores/auth';
	import { register } from '$lib/utils/api';

	export let isOpen = false;

	const dispatch = createEventDispatcher();

	let name = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let agreeToTerms = false;
	let error = '';
	let isLoading = false;

	async function handleRegister(e) {
		e.preventDefault();
		error = '';

		// Validation
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (!agreeToTerms) {
			error = 'Please agree to the Terms and Privacy Policy';
			return;
		}

		isLoading = true;

		try {
			const response = await register({ name, email, password });

			if (response.token) {
				authStore.login(response.token, response.user);
				isOpen = false;
				// Reset form
				name = '';
				email = '';
				password = '';
				confirmPassword = '';
				agreeToTerms = false;
			} else {
				error = response.message || 'Registration failed. Please try again.';
			}
		} catch (err) {
			error = err.message || 'An error occurred. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	function switchToLogin() {
		isOpen = false;
		dispatch('switchToLogin');
	}
</script>

<Modal bind:isOpen maxWidth="md">
	<div class="space-y-6">
		<div class="text-center">
			<h2 class="text-2xl font-medium text-black mb-2">Create Account</h2>
			<p class="text-sm text-black/60">Join us to create and manage events</p>
		</div>

		<form on:submit={handleRegister} class="space-y-4">
			{#if error}
				<div class="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
					<Icon icon="heroicons:exclamation-circle" class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
					<p class="text-sm text-red-700">{error}</p>
				</div>
			{/if}

			<Input
				bind:value={name}
				type="text"
				label="Full Name"
				placeholder="John Doe"
				required
				icon="heroicons:user"
			>
				<svelte:fragment slot="icon">
					<Icon icon="heroicons:user" class="w-5 h-5" />
				</svelte:fragment>
			</Input>

			<Input
				bind:value={email}
				type="email"
				label="Email"
				placeholder="your@email.com"
				required
				icon="heroicons:envelope"
			>
				<svelte:fragment slot="icon">
					<Icon icon="heroicons:envelope" class="w-5 h-5" />
				</svelte:fragment>
			</Input>

			<Input
				bind:value={password}
				type="password"
				label="Password"
				placeholder="••••••••"
				required
				helper="At least 8 characters"
				icon="heroicons:lock-closed"
			>
				<svelte:fragment slot="icon">
					<Icon icon="heroicons:lock-closed" class="w-5 h-5" />
				</svelte:fragment>
			</Input>

			<Input
				bind:value={confirmPassword}
				type="password"
				label="Confirm Password"
				placeholder="••••••••"
				required
				icon="heroicons:lock-closed"
			>
				<svelte:fragment slot="icon">
					<Icon icon="heroicons:lock-closed" class="w-5 h-5" />
				</svelte:fragment>
			</Input>

			<div>
				<label class="flex items-start gap-2 cursor-pointer">
					<input type="checkbox" bind:checked={agreeToTerms} required class="mt-1 rounded text-[#E10600] dark:text-[#FF4081] accent-[#E10600]" />
					<span class="text-sm text-black dark:text-white/80">
						I agree to the <a href="/terms" class="text-[#E10600] dark:text-[#FF4081] hover:text-[#C10500] dark:hover:text-[#E10600]">Terms of Service</a> and <a href="/privacy" class="text-[#E10600] dark:text-[#FF4081] hover:text-[#C10500] dark:hover:text-[#E10600]">Privacy Policy</a>
					</span>
				</label>
			</div>

			<Button type="submit" variant="primary" fullWidth disabled={isLoading}>
				{#if isLoading}
					<Icon icon="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
					Creating account...
				{:else}
					Create Account
				{/if}
			</Button>
		</form>

		<div class="relative">
			<div class="absolute inset-0 flex items-center">
				<div class="w-full border-t border-gray-200"></div>
			</div>
			<div class="relative flex justify-center text-sm">
				<span class="px-4 bg-white text-black/40">or</span>
			</div>
		</div>

		<button
			type="button"
			class="w-full py-3 rounded-xl border border-gray-200 text-black hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
		>
			<svg class="w-5 h-5" viewBox="0 0 24 24">
				<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
				<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
				<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
				<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
			</svg>
			Continue with Google
		</button>

		<p class="text-center text-sm text-black/60">
			Already have an account?
			<button
				type="button"
				on:click={switchToLogin}
				class="text-[#E10600] dark:text-[#FF4081] font-medium hover:text-[#C10500] dark:hover:text-[#E10600]"
			>
				Login
			</button>
		</p>
	</div>
</Modal>
