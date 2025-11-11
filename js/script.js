// --- DADOS DO PROJETO (Fácil de alterar) ---
const listaDeServicos = [
    { nome: "Corte de Cabelo", preco: 40.00 },
    { nome: "Barba", preco: 30.00 },
    { nome: "Completo (Corte + Barba)", preco: 65.00 },
    { nome: "Pezinho Simples", preco: 15.00 }
    // Para adicionar um novo serviço, basta adicionar um novo objeto aqui:
    // { nome: "Novo Serviço", preco: 50.00 }
];


// --- VARIÁVEIS E ELEMENTOS HTML ---
const form = document.getElementById('form-agendamento');
const listaAgendamentos = document.getElementById('agendamentos-list');
const mensagemStatus = document.getElementById('mensagem-status');


// --- FUNÇÃO DE PREENCHIMENTO DINÂMICO DOS SERVIÇOS (NOVO) ---
function popularServicos() {
    const selectServico = document.getElementById('servico');
    
    // Garante que a primeira opção padrão não seja substituída (Selecione um serviço)
    // Se o seu HTML já tem a opção padrão, você pode pular o innerHTML = ''
    
    listaDeServicos.forEach(servico => {
        const option = document.createElement('option');
        // O VALOR da opção é o nome do serviço
        option.value = servico.nome; 
        // O TEXTO visível inclui o preço formatado (R$ 40,00)
        option.textContent = `${servico.nome} (R$ ${servico.preco.toFixed(2).replace('.', ',')})`;
        selectServico.appendChild(option);
    });
}


// --- FUNÇÃO 1: Carregar e Exibir Agendamentos ---
function carregarAgendamentos() {
    const agendamentos = JSON.parse(localStorage.getItem('agendamentosBarbearia')) || [];
    
    listaAgendamentos.innerHTML = '';
    
    if (agendamentos.length === 0) {
        listaAgendamentos.innerHTML = '<li class="list-group-item">Nenhum horário agendado ainda.</li>';
        return;
    }

    agendamentos.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
    
    agendamentos.forEach((agendamento, index) => {
        const li = document.createElement('li');
        li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
        
        const dataFormatada = new Date(agendamento.dataHora).toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short'
        });

        li.innerHTML = `
            <div>
                <strong>Barbeiro:</strong> ${agendamento.barbeiro} <br> 
                <strong>Cliente:</strong> ${agendamento.nome} <br>
                <strong>Serviço:</strong> ${agendamento.servico} <br>
                <strong>Quando:</strong> ${dataFormatada}
            </div>
            <button class="btn btn-danger btn-sm" onclick="cancelarAgendamento(${index})">Cancelar</button>
        `;
        listaAgendamentos.appendChild(li);
    });
}


// --- FUNÇÃO 2: Salvar um Novo Agendamento ---
form.addEventListener('submit', function(event) {
    event.preventDefault();
    
    const nome = document.getElementById('nome').value.trim();
    const barbeiro = document.getElementById('barbeiro').value;
    const servico = document.getElementById('servico').value;
    const dataHoraInput = document.getElementById('data-hora').value;

    if (!nome || !barbeiro || !servico || !dataHoraInput) {
        mostrarStatus('Preencha todos os campos!', 'alert-warning');
        return;
    }

    const dataAgendamento = new Date(dataHoraInput);
    
    // 1. VALIDAÇÃO DE DATA PASSADA
    if (dataAgendamento < new Date()) {
        mostrarStatus('Atenção: Não é possível agendar em uma data/hora passada!', 'alert-danger');
        return;
    }

    // 2. VALIDAÇÃO DE HORÁRIO (8h às 20h)
    const hora = dataAgendamento.getHours();
    if (hora < 8 || hora >= 20) {
        mostrarStatus('Horário inválido. Agendamentos são apenas entre 8:00 e 20:00.', 'alert-danger');
        return;
    }
    
    // 3. VALIDAÇÃO DE INTERVALO (Apenas horários cheios e "e meia")
    const minuto = dataAgendamento.getMinutes();
    if (minuto !== 0 && minuto !== 30) {
        mostrarStatus('Horário inválido. Agendamentos são apenas em horários cheios ou "e meia" (ex: 8:00 ou 8:30).', 'alert-danger');
        return;
    }
    

    // Encontra o objeto de serviço para pegar o preço (opcional, mas bom para dados futuros)
    const servicoSelecionado = listaDeServicos.find(s => s.nome === servico);

    const novoAgendamento = {
        nome,
        barbeiro,
        servico,
        preco: servicoSelecionado ? servicoSelecionado.preco : 'Preço não encontrado',
        dataHora: dataHoraInput 
    };

    const agendamentos = JSON.parse(localStorage.getItem('agendamentosBarbearia')) || [];
    
    // Verificação de Conflito: Mesmo horário E mesmo barbeiro
    const conflito = agendamentos.some(item => 
        item.dataHora === novoAgendamento.dataHora && 
        item.barbeiro === novoAgendamento.barbeiro 
    );

    if (conflito) {
        mostrarStatus(`Erro: O horário já está reservado para ${barbeiro}. Escolha outro.`, 'alert-danger');
        return;
    }

    agendamentos.push(novoAgendamento);
    localStorage.setItem('agendamentosBarbearia', JSON.stringify(agendamentos));

    mostrarStatus('Agendamento realizado com sucesso!', 'alert-success');
    form.reset();
    carregarAgendamentos();
});


// --- FUNÇÃO 3: Cancelar Agendamento ---
function cancelarAgendamento(indexParaRemover) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        const agendamentos = JSON.parse(localStorage.getItem('agendamentosBarbearia')) || [];
        agendamentos.splice(indexParaRemover, 1); 
        localStorage.setItem('agendamentosBarbearia', JSON.stringify(agendamentos));
        
        carregarAgendamentos();
        mostrarStatus('Agendamento cancelado com sucesso.', 'alert-info');
    }
}


// --- FUNÇÃO 4: Mostrar Mensagens de Status ---
function mostrarStatus(mensagem, tipo) {
    mensagemStatus.className = 'mt-3'; 
    mensagemStatus.classList.add('alert', tipo);
    mensagemStatus.textContent = mensagem;
    
    setTimeout(() => {
        mensagemStatus.textContent = '';
        mensagemStatus.className = 'mt-3';
    }, 4000);
}


// --- INICIA A APLICAÇÃO ---
popularServicos(); // NOVO: Chama para preencher o campo Serviço
carregarAgendamentos();
