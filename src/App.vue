<script>
import SocketioService from "./services/socket.service.js";

export default {
  name: "App",
  components: {},
  methods: {
    scroll: function () {
      const elem = document.getElementById("chat-cover");
      elem.scrollTop = elem.scrollHeight;
    },
    createChat: function () {
      SocketioService.createChat();
    },
    joinChat: function (id) {
      SocketioService.joinChat(id);
    },
    submit: function (e) {
      e.preventDefault();
      if (this.text?.trim()?.length <= 0) {
        return;
      }
      SocketioService.sendMessage(this.text);
      this.messages.push({
        text: this.text,
        received: false,
      });
      this.scroll();
      this.text = "";
    },
    copy: function (id) {
      navigator.clipboard.writeText(id);
    },
  },
  data: function () {
    return {
      socket: SocketioService.socket,
      chat: SocketioService.chat,
      chatId: "",
      text: "",
      messages: [],
    };
  },
  beforeCreate: function () {
    SocketioService.setupSocketConnection();
  },
  created() {
    this.socket.on("created", (data) => {
      this.chat = data;
    });

    this.socket.on("joined", () => {
      this.messages.push({
        text: "Someone joined the chat",
        divider: true,
      });
      this.scroll();
    });

    this.socket.on("left", () => {
      this.messages.push({
        text: "Someone left the chat",
        divider: true,
      });
      this.scroll();
    });

    this.socket.on("message", (message) => {
      this.messages.push({
        text: message,
        received: true,
      });
      this.scroll();
    });

    this.socket.on("roomNotExist", () => {
      alert("This room does not exist");
      this.text = "";
      this.chat = "";
    });

    this.socket.on("roomFound", (room) => {
      this.chat = room;
    });
  },
  beforeUnmount() {
    SocketioService.disconnect();
  },
};
</script>

<template>
  <main class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col lg:flex-row-reverse">
      <div class="text-center lg:text-left md:ml-12">
        <h1 class="text-5xl font-bold">PrivChat</h1>
        <h2 class="text-2xl font-bold mt-2">Chat Now!</h2>
        <p class="py-6">
          With PrivChat you can create chats where no conversation is saved. We
          do not use cookies or ask for information. Just create a chat and
          share the code with other people, or use a code to join a chat.
        </p>
      </div>
      <div class="card flex-shrink-0 w-full max-w-lg shadow-2xl bg-base-100">
        <div class="card-body items-center flex flex-col" v-if="!chat">
          <article class="prose">
            <h1 class="m-0">Create a Chat Now!</h1>
          </article>
          <button class="btn btn-primary w-full mt-4" @click="createChat()">
            Create
          </button>
          <div class="divider mt-8">OR</div>
          <article class="prose"></article>
          <article class="prose">
            <h2>Join a chat</h2>
          </article>

          <form
            class="w-[100%] bottom-4 self-center"
            @submit="joinChat(this.chatId)"
          >
            <input
              type="text"
              placeholder="Chat id"
              class="input input-bordered w-full mt-4"
              @input="
                (e) => {
                  this.chatId = e.target.value;
                }
              "
            />
          </form>

          <button
            class="btn btn-secondary w-full mt-4"
            @click="joinChat(this.chatId)"
          >
            Join
          </button>
        </div>

        <div class="card-body items-center flex flex-col" v-if="chat">
          <article class="prose">
            <h1 v-if="chat" class="text-lg">
              Id:
              <b
                class="link-hover cursor-pointer"
                id="id-chat"
                @click="copy(chat)"
                >{{ chat }}</b
              >
            </h1>
          </article>
          <ul
            class="h-[400px] w-full bg-base-300 p-4 rounded-lg mt-4 flex flex-col overflow-auto scroll-smooth"
            id="chat-cover"
          >
            <li v-for="value in messages" class="w-full flex flex-col">
              <div
                v-if="value.received === true && value?.text?.length"
                class="p-2 text-md bg-secondary max-w-[65%] w-auto rounded-md my-4 self-start"
              >
                <p class="text-white break-words">{{ value.text }}</p>
              </div>
              <div
                v-else-if="value.received === false && value?.text?.length"
                class="p-2 text-md bg-primary max-w-[65%] rounded-md my-4 self-end"
              >
                <p class="text-white break-words">{{ value.text }}</p>
              </div>
              <div
                v-else-if="value.divider === true && value?.text?.length"
                class="divider mt-8"
              >
                {{ value.text }}
              </div>
            </li>
            <div class="p-2 my-4 self-start"></div>
          </ul>
          <form
            @submit="(e) => submit(e)"
            class="w-[100%] bottom-4 self-center"
          >
            <input
              type="text"
              placeholder="Type here..."
              class="input input-bordered w-full mt-4 input-primary"
              :value="text"
              @input="
                (e) => {
                  this.text = e.target.value;
                }
              "
            />
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<style>
#chat-cover {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

#chat-cover::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>
