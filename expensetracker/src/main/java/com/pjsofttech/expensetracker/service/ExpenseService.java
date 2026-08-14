package com.pjsofttech.expensetracker.service;

import com.pjsofttech.expensetracker.dto.*;
import com.pjsofttech.expensetracker.model.*;
import com.pjsofttech.expensetracker.repository.CategoryRepository;
import com.pjsofttech.expensetracker.repository.ContactRepository;
import com.pjsofttech.expensetracker.repository.ExpenseInstallmentRepository;
import com.pjsofttech.expensetracker.repository.ExpenseRepository;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class ExpenseService {
    @Autowired
    private ExpenseInstallmentRepository expenseInstallmentRepository;
    @Autowired
    private ExpenseRepository expenseRepository;
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private ContactRepository contactRepository;

    @Transactional
    public ExpenseResponseDto addExpense(@Valid ExpenseRequestDto expenseRequestDto, User loggedInUser) {
        if(expenseRequestDto.getContactId() == null){
            throw new IllegalArgumentException("Contact ID cannot be null");
        }
        if(expenseRequestDto.getCategoryId() == null){
            throw new IllegalArgumentException("Category ID cannot be null");
        }
        Category category = categoryRepository.findById(
                expenseRequestDto.getCategoryId()
        ).orElseThrow(() ->
                new RuntimeException("Category not found"));
        Contact contact = contactRepository.findById(expenseRequestDto.getContactId())
                .orElseThrow(()->new RuntimeException("Contact Not Found"));
        Expense expense = getExpense(expenseRequestDto, loggedInUser, contact, category);
        Long totalAmount = calculateTotalAmount(expense);
        expense.setTotal(totalAmount);

        expenseRepository.save(expense);
        // -------------------------------------
        // SAVE PAYMENT 1
        // -------------------------------------

        if (expenseRequestDto.getPaymentType()
                == PaymentType.INSTALLMENT) {

            InstallmentRequestDto initialPayment =
                    expenseRequestDto.getInstallmentRequestDto();
            if (initialPayment == null) {
                throw new IllegalArgumentException(
                        "Initial payment details are required for installment payment"
                );
            }

            if (initialPayment.getAmount() == null ||
                    initialPayment.getAmount() <= 0) {
                throw new IllegalArgumentException(
                        "Initial payment must be greater than zero"
                );
            }

            ExpenseInstallment installment =
                    ExpenseInstallment.builder()
                            .expense(expense)
                            .amount(
                                    initialPayment.getAmount()
                            )
                            .date(
                                    initialPayment.getDate()
                            )

                            .build();

            expenseInstallmentRepository.save(
                    installment
            );

            Long paid =
                    initialPayment.getAmount();

            if (paid >= totalAmount) {
                expense.setPaymentStatus(PaymentStatus.COMPLETE);
            } else if (paid > 0) {
                expense.setPaymentStatus(PaymentStatus.PARTIAL);
            } else {
                expense.setPaymentStatus(PaymentStatus.PENDING);
            }
            if (expenseRequestDto.getPaymentType() == PaymentType.ONE_TIME) {

                expense.setPaymentStatus(PaymentStatus.COMPLETE);

                // No installment record necessary

            } else if (expenseRequestDto.getPaymentType() == PaymentType.INSTALLMENT) {

                // Create initial installment

                // Calculate status from paid amount
            }

            expenseRepository.save(expense);
        }

        return getResponseDto(expense);
    }

    private static Expense getExpense(ExpenseRequestDto expenseRequestDto, User loggedInUser, Contact contact, Category category) {
        return Expense.builder()
                .owner(loggedInUser)
                .amount(expenseRequestDto.getAmount())
                .contact(contact)
                .total(expenseRequestDto.getTotal())
                .type(expenseRequestDto.getType())
                .gstNumber(expenseRequestDto.getGstNumber())
                .gstPercentage(expenseRequestDto.getGstPercentage())
                .remark(expenseRequestDto.getRemark())
                .particular(expenseRequestDto.getParticular())
                .paymentType(expenseRequestDto.getPaymentType())
//                .paymentStatus(expenseRequestDto.getPaymentStatus())
                .tdsPercentage(expenseRequestDto.getTdsPercentage())
                .date(expenseRequestDto.getDate())
                .category(category)
                .build();
    }

    private static ExpenseResponseDto getResponseDto(ExpenseRequestDto expenseRequestDto, Contact contact,Category category) {
        return ExpenseResponseDto.builder()
                .date(expenseRequestDto.getDate())
                .amount(expenseRequestDto.getAmount())
                .contact(ContactResponseDto.builder().id(contact.getId()).name(contact.getName()).email(contact.getEmail()).build())
                .total(expenseRequestDto.getTotal())
                .type(expenseRequestDto.getType())
                .gstNumber(expenseRequestDto.getGstNumber())
                .gstPercentage(expenseRequestDto.getGstPercentage())
                .remark(expenseRequestDto.getRemark())
                .particular(expenseRequestDto.getParticular())
                .paymentType(expenseRequestDto.getPaymentType())
//                .paymentStatus(expenseRequestDto.getPaymentStatus())
                .tdsPercentage(expenseRequestDto.getTdsPercentage())
                .date(expenseRequestDto.getDate())
                .category(CategoryResponseDto.builder().id(category.getId()).name(category.getName()).build())
                .build();
    }

    public List<ExpenseResponseDto> getAllExpensesByCategory(Long id) {
        Category category = categoryRepository.findById(id).orElseThrow(()->new RuntimeException("Category Not Found"));
        return expenseToExpenseResponseDto(expenseRepository.findByCategory(category));

    }

    public List<ExpenseResponseDto> getAllExpensesByContact(Long id) {
        Contact contact = contactRepository.findById(id).orElseThrow(()->new RuntimeException("Contact Not Found!"));
        return expenseToExpenseResponseDto(expenseRepository.findByContact(contact));
    }

    public List<ExpenseResponseDto> getAllExpensesByPaymentType(PaymentType paymentStatusRequestDto) {
        return expenseToExpenseResponseDto(expenseRepository.findByPaymentType(paymentStatusRequestDto));

    }

    public List<ExpenseResponseDto> getAllExpensesByTransactionType(TransactionType transactionType) {

        return
                expenseToExpenseResponseDto(expenseRepository.findByType(transactionType));

    }
    public List<ExpenseResponseDto> getAllExpensesByDate(LocalDate date) {
        return expenseToExpenseResponseDto(expenseRepository.findByDate(date));

    }

public List<ExpenseResponseDto> getAllExpenses(User loggedInUser) {

    List<Expense> expenses =
            expenseRepository.findByOwner(loggedInUser);

    AtomicInteger index = new AtomicInteger(1);

    return expenses.stream()
            .map(expense -> {

                Long amount =
                        expense.getAmount();

                Long gstPercentage =
                        valueOrZero(expense.getGstPercentage());

                Long tdsPercentage =
                        valueOrZero(expense.getTdsPercentage());

                Long gstAmount =
                        (amount * gstPercentage) / 100;

                Long tdsAmount =
                        (amount * tdsPercentage) / 100;

                Long totalAmount =
                        amount + gstAmount - tdsAmount;

//                Long paid =
//                        expenseInstallmentRepository
//                                .getTotalPaidByExpense(expense);
                Long paid;
                if (expense.getPaymentType() == PaymentType.ONE_TIME) {
                    paid = totalAmount;
                } else {
                    paid = expenseInstallmentRepository
                            .getTotalPaidByExpense(expense);

                    paid = valueOrZero(paid);
                }

                Long pending =
                        Math.max(totalAmount - paid, 0L);
                PaymentStatus paymentStatus =
                        calculatePaymentStatus(paid, totalAmount);

                return ExpenseResponseDto.builder()
                        .id(expense.getId())
                        .index(index.getAndIncrement())
                        .date(expense.getDate())

                        .contact(
                                ContactResponseDto.builder()
                                        .id(expense.getContact().getId())
                                        .email(expense.getContact().getEmail())
                                        .phoneNumber(expense.getContact().getPhoneNumber())
                                        .name(expense.getContact().getName())
                                        .build()
                        )

                        .category(
                                CategoryResponseDto.builder()
                                        .id(expense.getCategory().getId())
                                        .name(expense.getCategory().getName())
                                        .build()
                        )

                        .particular(expense.getParticular())

                        .amount(amount)

                        .gstPercentage(gstPercentage)
                        .gstNumber(expense.getGstNumber())
                        .gstAmount(gstAmount)

                        .tdsPercentage(tdsPercentage)

                        .total(totalAmount)
                        .paid(paid)
                        .pending(pending)

                        .paymentType(expense.getPaymentType())
                        .paymentStatus(paymentStatus)

                        .remark(expense.getRemark())
                        .type(expense.getType())

                        .build();
            })
            .toList();
}
    private Long calculatePaid(
            Expense expense,
            Long totalAmount
    ) {

        if (expense.getPaymentType() == PaymentType.ONE_TIME) {
            return totalAmount;
        }

        return expenseInstallmentRepository
                .getTotalPaidByExpense(expense);
    }
    private Long valueOrZero(Long value) {
        return value == null ? 0 : value;
    }
    private PaymentStatus calculatePaymentStatus(
            Long paid,
            Long total
    ) {

        paid = valueOrZero(paid);
        total = valueOrZero(total);

        if (paid <= 0) {
            return PaymentStatus.PENDING;
        }

        if (paid >= total) {
            return PaymentStatus.COMPLETE;
        }

        return PaymentStatus.PARTIAL;
    }

    private List<ExpenseResponseDto> expenseToExpenseResponseDto(List<Expense> expenses){
        return expenses.stream()
                .map(
                        e->
                                ExpenseResponseDto.builder()
                                        .category(CategoryResponseDto.builder()
                                                .id(e.getCategory().getId()).name(e.getCategory().getName()).build())
                                        .amount(e.getAmount())
                                        .date(e.getDate())
                                        .remark(e.getRemark())
                                        .gstNumber(e.getGstNumber())
                                        .gstPercentage(e.getGstPercentage())
                                        .total(e.getTotal()).type(e.getType())
                                        .tdsPercentage(e.getTdsPercentage())
                                        .particular(e.getParticular())
                                        .paymentType(e.getPaymentType())
                                        .paymentStatus(calculatePaymentStatus(calculatePaid(e,e.getTotal()),e.getTotal()))
                                        .contact(ContactResponseDto.builder()
                                                .id(e.getContact().getId())
                                                .name(e.getContact().getName())
                                                .email(e.getContact().getEmail())
                                                .phoneNumber(e.getContact().getPhoneNumber())
                                                .build())
                                        .build()).toList();
    }

    public ExpenseResponseDto addInstallment(
            Long expenseId,
            InstallmentRequestDto request
    ) {

        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() ->
                        new RuntimeException("Expense not found"));

        if (request.getAmount() == null || request.getAmount() <= 0) { throw new IllegalArgumentException( "Payment amount must be greater than zero" ); }
        Long totalAmount = calculateTotalAmount(expense);

        Long alreadyPaid =
                expenseInstallmentRepository
                        .getTotalPaidByExpense(expense);

        if (alreadyPaid == null) { alreadyPaid = 0L; }

        Long remaining = totalAmount - alreadyPaid;

        if (remaining <= 0) { throw new IllegalArgumentException( "This expense is already fully paid" ); }

        if (request.getAmount() > remaining) {
            throw new IllegalArgumentException(
                    "Installment cannot be greater than pending amount"
            );
        }

        ExpenseInstallment installment =
                ExpenseInstallment.builder()
                        .expense(expense)
                        .amount(request.getAmount())
                        .date(request.getDate())
//                        .remark(request.getRemark())
                        .build();

        expenseInstallmentRepository.save(installment);

        Long newPaid = alreadyPaid + request.getAmount();

        if (newPaid >= totalAmount) {
            expense.setPaymentStatus(PaymentStatus.COMPLETE);
        } else if (newPaid > 0 && newPaid < totalAmount) {
            expense.setPaymentStatus(PaymentStatus.PARTIAL);
        } else {
            expense.setPaymentStatus(PaymentStatus.PENDING);
        }
        expense.setTotal(totalAmount);
        expenseRepository.save(expense);
        return getResponseDto(expense);
    }
    private Long calculateTotalAmount(Expense expense) {

        Long amount = valueOrZero(expense.getAmount());

        Long gstPercentage =
                valueOrZero(expense.getGstPercentage());

        Long tdsPercentage =
                valueOrZero(expense.getTdsPercentage());

        Long gstAmount =
                (amount * gstPercentage) / 100;

        Long tdsAmount =
                (amount * tdsPercentage) / 100;

        return amount + gstAmount - tdsAmount;
    }
    private ExpenseResponseDto getResponseDto( Expense expense ) { Long totalAmount = calculateTotalAmount(expense); Long paid = expenseInstallmentRepository .getTotalPaidByExpense(expense); if (paid == null) { paid = 0L; } Long pending = Math.max(totalAmount - paid, 0L); return ExpenseResponseDto.builder() .id(expense.getId()) .date(expense.getDate()) .amount(expense.getAmount()) .contact( ContactResponseDto.builder() .id(expense.getContact().getId()) .name(expense.getContact().getName()) .email(expense.getContact().getEmail()) .phoneNumber( expense.getContact().getPhoneNumber() ) .build() ) .category( CategoryResponseDto.builder() .id(expense.getCategory().getId()) .name(expense.getCategory().getName()) .build() ) .total(totalAmount) .paid(paid) .pending(pending) .type(expense.getType()) .gstNumber(expense.getGstNumber()) .gstPercentage(expense.getGstPercentage()) .tdsPercentage(expense.getTdsPercentage()) .remark(expense.getRemark()) .particular(expense.getParticular()) .paymentType( paid >= totalAmount ? PaymentType.ONE_TIME : PaymentType.INSTALLMENT ) .build(); }
}
