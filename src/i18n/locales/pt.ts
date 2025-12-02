
export default {
  common: {
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    cancel: "Cancelar",
    save: "Salvar",
    delete: "Excluir",
    confirm: "Confirmar",
    back: "Voltar",
    close: "Fechar",
    or: "OU",
    unknownUser: "Usuário Desconhecido"
  },
  auth: {
    signIn: {
      title: "Entrar",
      subtitle: "Sua noite de cinema resolvida.",
      button: "Entrar",
      google: "Continuar com Google",
      forgotPassword: "Esqueceu a senha?",
      noAccount: "Não tem conta?",
      signUpLink: "Cadastre-se"
    },
    signUp: {
      title: "Criar Conta",
      subtitle: "Junte-se ao clube.",
      button: "Criar Conta",
      alreadyHaveAccount: "Já tem uma conta?",
      signInLink: "Entrar",
      passwordStrength: {
        weak: "Fraca",
        medium: "Média",
        strong: "Forte"
      }
    },
    fields: {
      email: "E-mail",
      password: "Senha",
      confirmPassword: "Confirmar Senha",
      displayName: "Nome de Exibição"
    },
    errors: {
      fillAll: "Por favor, preencha todos os campos.",
      passwordMatch: "As senhas não coincidem.",
      passwordWeak: "A senha não é forte o suficiente.",
      invalidEmail: "Insira um e-mail válido.",
      userNotFound: "Conta não encontrada com este e-mail.",
      wrongPassword: "Senha incorreta."
    }
  },
  groups: {
    dashboard: {
      title: "Meus Grupos",
      createButton: "Criar Novo Grupo",
      emptyState: {
        title: "Sua equipe de cinema aguarda",
        subtitle: "Comece seu primeiro grupo para resolver os debates de filmes. 🍿"
      }
    },
    card: {
      members: "{{count}} membro",
      members_plural: "{{count}} membros",
      movies: "{{count}} filme",
      movies_plural: "{{count}} filmes",
      lastActive: "Ativo: {{time}}"
    },
    create: {
      title: "Criar Novo Grupo",
      nameLabel: "Nome do Grupo",
      placeholder: "ex: Noite de Cinema",
      colorLabel: "Cor do Grupo",
      submit: "Criar Grupo"
    },
    join: {
      title: "Entrar no Grupo",
      subtitle: "Insira o código de convite de 6 caracteres.",
      placeholder: "ABC123",
      button: "Entrar",
      invitedTo: "Você foi convidado para:",
      backButton: "Voltar para meus grupos"
    },
    details: {
      tabs: {
        watchlist: "Lista",
        members: "Membros"
      },
      spinButton: "Girar Roleta",
      historyButton: "Histórico",
      inviteButton: "Convidar Amigos",
      emptyWatchlist: {
        title: "Nenhum Filme Encontrado",
        subtitle: "Adicione um filme para começar!"
      }
    },
    members: {
      title: "Membros ({{count}})",
      ownerBadge: "Dono",
      remove: "Remover Membro",
      leave: "Sair do Grupo"
    }
  },
  movies: {
    add: {
      button: "Adicionar Filme",
      title: "Adicionar Filmes",
      placeholder: "Buscar filme...",
      tabs: {
        popular: "🔥 Populares",
        browse: "🔭 Explorar",
        search: "🔍 Resultados"
      },
      categories: {
        trending: "🔥 Em Alta Hoje",
        topRated: "⭐ Melhores Avaliados",
        nowPlaying: "🎬 Nos Cinemas"
      }
    },
    card: {
      addedBy: "Adicionado por {{name}}",
      deleteConfirm: {
        title: "Excluir filme?",
        description: "Isso removerá permanentemente \"{{title}}\" da lista de filmes.",
        button: "Excluir"
      }
    },
    opinions: {
      mustWatch: "Quero ver",
      seen: "Já vi",
      pass: "Passo"
    },
    preview: {
      addToWatchlist: "+ Adicionar à Lista",
      added: "✓ Adicionado",
      watchTrailer: "Ver Trailer 🎬"
    }
  },
  roulette: {
    title: "Roleta de Filmes",
    spinButton: "Girar a Roleta!",
    spinning: "Girando...",
    emptyTitle: "A Roleta está vazia!",
    emptySubtitle: "Adicione filmes à lista para começar.",
    filters: {
      mustWatch: "🌟 Quero ver",
      all: "🎬 Todos",
      mustWatchSeen: "🌟✅ Quero + Vi",
      mustWatchPass: "🌟👎 Quero + Passo"
    },
    result: {
      title: "VAMOS ASSISTIR ESSE!",
      markWatched: "✓ Marcar como Assistido",
      spinAgain: "Girar Novamente",
      back: "Voltar"
    }
  },
  history: {
    title: "Histórico",
    subtitle: "{{count}} filme assistido",
    subtitle_plural: "{{count}} filmes assistidos",
    filter: {
      label: "Filtro:",
      all: "Tudo",
      month: "Mês",
      year: "Ano"
    },
    sort: {
      label: "Ordenar:",
      recent: "Recente",
      rating: "Avaliação"
    },
    stats: {
      total: "Filmes Assistidos",
      avgRating: "Avaliação Média",
      genre: "Gênero Favorito",
      contributor: "Maior Contribuidor"
    },
    card: {
      watchedOn: "Assistido em {{date}}",
      yourRating: "Sua avaliação:",
      comments: {
        show: "Ver Comentários",
        hide: "Ocultar Comentários",
        placeholder: "Adicione um comentário...",
        post: "Publicar",
        empty: "Seja o primeiro a comentar!"
      },
      unwatch: {
        button: "Desmarcar",
        title: "Desmarcar como assistido?",
        description: "Isso moverá \"{{title}}\" de volta para a lista de filmes.",
        confirm: "Mover para Lista"
      }
    }
  },
  settings: {
    title: "Configurações",
    backProfile: "Voltar ao Perfil",
    password: {
      title: "Alterar Senha",
      current: "Senha Atual",
      new: "Nova Senha",
      confirm: "Confirmar Nova Senha",
      update: "Atualizar Senha",
      googleAccount: "Você entrou com uma conta Google. O gerenciamento de senha é feito pelo Google."
    },
    language: {
      title: "Idioma",
      label: "Idioma do App"
    }
  }
};
