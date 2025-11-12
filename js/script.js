const listaDeServicos = [
    { nome: "Corte de Cabelo", preco: 40.00 },
    { nome: "Barba", preco: 30.00 },
    { nome: "Completo (Corte + Barba)", preco: 65.00 },
    { nome: "Pezinho Simples", preco: 15.00 }
];

const form = document.getElementById('form-agendamento');
const listaAgendamentos = document.getElementById('agendamentos-list');
const mensagemStatus = document.getElementById('mensagem-status');

function popularServicos() {
    const selectServico = document.getElementById('servico');
        
    listaDeServicos.forEach(servico => {
        const option = document.createElement('option');
        option.value = servico.nome; 
        option.textContent = `${servico.nome} (R$ ${servico.preco.toFixed(2).replace('.', ',')})`;
        selectServico.appendChild(option);
    });
}

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
    
    if (dataAgendamento < new Date()) {
        mostrarStatus('Atenção: Não é possível agendar em uma data/hora passada!', 'alert-danger');
        return;
    }

    const hora = dataAgendamento.getHours();
    if (hora < 8 || hora >= 20) {
        mostrarStatus('Horário inválido. Agendamentos são apenas entre 8:00 e 20:00.', 'alert-danger');
        return;
    }
    
    const minuto = dataAgendamento.getMinutes();
    if (minuto !== 0 && minuto !== 30) {
        mostrarStatus('Horário inválido. Agendamentos são apenas em horários cheios ou "e meia" (ex: 8:00 ou 8:30).', 'alert-danger');
        return;
    }
    

    const servicoSelecionado = listaDeServicos.find(s => s.nome === servico);

    const novoAgendamento = {
        nome,
        barbeiro,
        servico,
        preco: servicoSelecionado ? servicoSelecionado.preco : 'Preço não encontrado',
        dataHora: dataHoraInput 
    };

    const agendamentos = JSON.parse(localStorage.getItem('agendamentosBarbearia')) || [];
    
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


function cancelarAgendamento(indexParaRemover) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        const agendamentos = JSON.parse(localStorage.getItem('agendamentosBarbearia')) || [];
        agendamentos.splice(indexParaRemover, 1); 
        localStorage.setItem('agendamentosBarbearia', JSON.stringify(agendamentos));
        
        carregarAgendamentos();
        mostrarStatus('Agendamento cancelado com sucesso.', 'alert-info');
    }
}

function mostrarStatus(mensagem, tipo) {
    mensagemStatus.className = 'mt-3'; 
    mensagemStatus.classList.add('alert', tipo);
    mensagemStatus.textContent = mensagem;
    
    setTimeout(() => {
        mensagemStatus.textContent = '';
        mensagemStatus.className = 'mt-3';
    }, 4000);
}

popularServicos(); // NOVO: Chama para preencher o campo Serviço
carregarAgendamentos();
