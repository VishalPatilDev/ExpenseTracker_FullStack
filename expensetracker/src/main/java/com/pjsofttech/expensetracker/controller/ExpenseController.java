package com.pjsofttech.expensetracker.controller;

import com.pjsofttech.expensetracker.dto.ExpenseRequestDto;
import com.pjsofttech.expensetracker.dto.ExpenseResponseDto;
import com.pjsofttech.expensetracker.dto.InstallmentRequestDto;
import com.pjsofttech.expensetracker.dto.PaymentTypeRequestDto;
import com.pjsofttech.expensetracker.model.PaymentStatus;
import com.pjsofttech.expensetracker.model.PaymentType;
import com.pjsofttech.expensetracker.model.TransactionType;
import com.pjsofttech.expensetracker.model.User;
import com.pjsofttech.expensetracker.repository.UserRepository;
import com.pjsofttech.expensetracker.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/pjsofttech/expense")
public class ExpenseController {
    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> addExpense(@Valid @RequestBody ExpenseRequestDto expenseRequestDto, Authentication authentication){
        String email = authentication.getName();
        User loggedInUser = userRepository.findByEmail(email)
                .orElseThrow(()->new RuntimeException("User Not Found !"));
        return ResponseEntity.status(HttpStatus.OK)
                .body(expenseService.addExpense(expenseRequestDto,loggedInUser));
    }

    @GetMapping("/byCategory/{id}")
    public ResponseEntity<?> getAllExpensesByCategory(@PathVariable Long id ){
        return ResponseEntity.status(HttpStatus.OK)
                .body(expenseService.getAllExpensesByCategory(id));
    }

    @GetMapping("/byContact/{id}")
    public ResponseEntity<?> getAllExpensesByContact(@PathVariable Long id ){
        return ResponseEntity.status(HttpStatus.OK)
                .body(expenseService.getAllExpensesByContact(id));
    }
    @GetMapping("byPaymentStatus")
    public ResponseEntity<?> getAllExpensesByPaymentStatus(@RequestParam PaymentType paymentTypeRequestDto){
        return ResponseEntity.status(HttpStatus.OK)
                .body(expenseService.getAllExpensesByPaymentType(paymentTypeRequestDto));
    }
    @GetMapping("byDate")
    public ResponseEntity<?> getAllExpensesByDate(@RequestParam LocalDate date){
        return ResponseEntity.status(HttpStatus.OK)
                .body(expenseService.getAllExpensesByDate(date));
    }

    @GetMapping("byTransactionType")
    public ResponseEntity<?> getAllExpensesByTransactionType(@RequestParam TransactionType transactionType){
        return ResponseEntity.status(HttpStatus.OK)
                .body(expenseService.getAllExpensesByTransactionType(transactionType));
    }

    @GetMapping("/expenses")
    public ResponseEntity<?> getAllExpenses(Authentication authentication){
        String email = authentication.getName();
        User loggedInUser = userRepository.findByEmail(email).orElseThrow(()->new RuntimeException("User Not Found"));
        return ResponseEntity.status(HttpStatus.OK)
                .body(expenseService.getAllExpenses(loggedInUser));
    }

    @PostMapping("/{expenseId}/installment")
    public ResponseEntity<ExpenseResponseDto> addInstallment(
            @PathVariable Long expenseId,
            @RequestBody InstallmentRequestDto request ) {
        ExpenseResponseDto response =
                expenseService.addInstallment( expenseId, request );
        return ResponseEntity.ok(response); }

}
